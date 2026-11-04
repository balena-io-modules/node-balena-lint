export const { promise, resolve } = Promise.withResolvers<void>();

export const generic = new Promise<void>((res) => {
	res();
});

const wrap = <T>(x: T) => [x];
// Only the allowlisted calls may take `void`, and an unused directive is an error
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export const notAllowed = wrap<void>(undefined);
