import client from "@/hooks/fetch";
import { toast } from "@/hooks/use-toast";
import type { paths } from "@/types/openapi";
import type { PathsWithMethod } from "openapi-typescript-helpers";

class FetchHelpers {
  testGlobalFunc(param: string): string {
    console.log("Global Function Called with:", param);
    return "a";
  }
  async refreshRetryAPIroute(
    route: PathsWithMethod<paths, "get">,
  ): Promise<boolean> {
    let errorOcurred = false;
    try {
      const { response } = await client.POST("/api/refresh", {});
      if (response.status == 401) {
        // The refresh token was invalid, could not refresh so back to login.
        // This has to be done for every fetch
        await client.POST("/api/users/me/logout", {});
        window.location.href = "/login";
      } else if (response.status == 201) {
        // retry the specified route
        const { data, response } = await client.GET(route, {});
        console.log(data);
        if (response.status == 401) {
          // MSAL client may no longer have user in cache, no other option other than to log out
          await client.POST("/api/users/me/logout", {});
          window.location.href = "/login";
        }
      }
      return errorOcurred;
    } catch (error) {
      errorOcurred = true;
      this.toastDestructiveError(error as undefined);
      return errorOcurred;
    }
  }

  toastDestructiveError(error: undefined): void {
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    });
  }
}

const fetchHelpers = new FetchHelpers();
export default fetchHelpers;
