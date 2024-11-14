import { createFactory } from "jsr:@hono/hono@^4.6.10/factory";
import { HTTPException } from "jsr:@hono/hono@^4.6.10/http-exception";
import { delay } from "jsr:@std/async/delay";
import { logger } from "jsr:@hono/hono@^4.6.10/logger";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { $numericString } from "jsr:@showichiro/validators";

const HELP = `
Usage:
  --mode     Mode of operation [echo|internal-server-error|delay]. Default is echo.
  --port     Port to listen on. Default is 3000.
  --delay-time    Delay time in milliseconds for delay mode. Default is 3000.
` as const;

enum Mode {
  INTERNAL_SERVER_ERROR = "internal-server-error",
  ECHO = "echo",
  DELAY = "delay",
}

const args = parseArgs(Deno.args, {
  string: ["mode", "port", "delay-time"],
  boolean: ["help"],
  default: {
    mode: Mode.ECHO,
    port: "3000",
    "delay-time": "3000",
  },
});

const factory = createFactory();

const echoHandlers = factory.createHandlers(async (c) => {
  const query = c.req.query();
  const path = c.req.path;
  const bodyText = await c.req.text();
  const method = c.req.method;
  const headers = c.req.header();
  const contentType = c.req.header("content-Type");
  let res: Record<string, unknown> = { query, path, bodyText, method, headers };
  if (contentType === "application/json") {
    const json = await c.req.json();
    res = { ...res, json };
  }
  return c.json(res);
});

const internalServerErrorHandlers = factory.createHandlers(() => {
  throw new HTTPException(500);
});

const delayHandlers = factory.createHandlers(async (c) => {
  if (!$numericString(args["delay-time"])) {
    throw new HTTPException(500, { message: "invalid delay time" });
  }
  await delay(Number(args["delay-time"]));
  return c.text("delayed");
});

const selectHandler = (mode: string) => {
  switch (mode) {
    case Mode.ECHO:
      return echoHandlers;
    case Mode.INTERNAL_SERVER_ERROR:
      return internalServerErrorHandlers;
    case Mode.DELAY:
      return delayHandlers;
    default:
      return echoHandlers;
  }
};

const app = factory.createApp();

if (import.meta.main) {
  const { mode, port, help } = args;

  if (help) {
    console.log(HELP);
    Deno.exit(0);
  }

  if (!$numericString(port)) {
    Deno.exit(1);
  }

  const handler = selectHandler(mode);

  app.all("*", ...handler);

  app.use(logger());

  Deno.serve({ port: Number(port) }, app.fetch);
}
