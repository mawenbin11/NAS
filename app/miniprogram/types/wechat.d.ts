declare function App(options: Record<string, unknown>): void;

declare function Page<TData extends Record<string, unknown>, TCustom extends Record<string, unknown>>(
  options: ThisType<TCustom & { data: TData; setData: (data: Partial<TData>) => void }> &
    TCustom & {
    data: TData;
    setData?: (data: Partial<TData>) => void;
  },
): void;

declare namespace WechatMiniprogram {
  type IAnyObject = Record<string, unknown>;

  type InputEvent = {
    detail: {
      value?: string;
    };
  };
}

declare const wx: {
  request(options: {
    url: string;
    method: "GET" | "POST";
    success(response: { statusCode: number; data: unknown }): void;
    fail(error: { errMsg: string }): void;
  }): void;
};
