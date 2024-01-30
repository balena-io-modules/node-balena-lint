const fn = () => ({
	a: 1,
	b: 2,
});

const { a, b } = fn();

export const x = a
	? {
			key: 'A',
			value: 'B',
		}
	: {};

// @ts-expect-error b/c reasons
export const xx: number = 'asdf';

export interface A {
	aProp:
		| {
				key: string;
				value: string;
		  }
		| string;
}

console.log(a, b);
