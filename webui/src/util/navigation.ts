import { useMemo } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";

export type Navigator = Readonly<{
  toImage: (imageId: string) => void;
  toSearch: (replace?: boolean) => void;
  toApiDocs: () => void;
  toChangePw: () => void;
  toAdmin: () => void;
  toRequests: () => void;
}>;

class NavImpl implements Navigator {
  private readonly pre = "/sd";
  constructor(private readonly navigate: NavigateFunction) {}

  private plain = (suff: string) => this.navigate(`${this.pre}/${suff}`);
  private create = (suff: string) => () => this.plain(suff);

  toImage(imageId: string) {
    this.plain(`search/${imageId}`);
  }

  toSearch(replace?: boolean) {
    this.navigate(`${this.pre}/search`, { replace });
  }

  toApiDocs = this.create("api");
  toChangePw = this.create("password");
  toAdmin = this.create("administration");
  toRequests = this.create("requests");
}

export const useNavigator = (): Navigator => {
  const navigate = useNavigate();
  return useMemo(() => new NavImpl(navigate), [navigate]);
};
