export interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
}


export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {

    const url = new URL(request.url);

    // 静态资源
    const assetResponse = await env.ASSETS.fetch(request);

    return assetResponse;
  },
};
