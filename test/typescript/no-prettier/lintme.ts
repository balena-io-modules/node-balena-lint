const fn = () => ({ a: 1, b: 2 });

const { a, b } = fn();

const x = a ? { key: 'A', value: 'B' } : {};

interface A {
	aProp: { key: string; value: string; } | string;
}

console.log(a, b);
