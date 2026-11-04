import typescriptEslint from '@typescript-eslint/eslint-plugin';

const baseRule = typescriptEslint.rules['no-invalid-void-type'];
const [baseSchema] = baseRule.meta.schema;

/** @param {string} s */
const stripWhitespace = (s) => s.replaceAll(/\s/g, '');

/**
 * `@typescript-eslint/no-invalid-void-type` with an extra
 * `allowInCallTypeArguments` option listing functions whose calls may take
 * `void` as a type argument, so that eg `Promise.withResolvers<void>()` is
 * allowed. Upstream always reports `void` type arguments on calls and has no
 * option for it:
 * https://github.com/typescript-eslint/typescript-eslint/issues/3612
 * https://github.com/typescript-eslint/typescript-eslint/issues/8113
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
	meta: {
		...baseRule.meta,
		schema: [
			{
				...baseSchema,
				properties: {
					...baseSchema.properties,
					allowInCallTypeArguments: {
						type: 'array',
						description:
							'Functions whose calls may take `void` as a type argument, eg `Promise.withResolvers`.',
						items: { type: 'string' },
					},
				},
			},
		],
	},
	create(context) {
		const {
			allowInCallTypeArguments = ['Promise.withResolvers'],
			...baseOptions
		} = context.options[0] ?? {};
		const allowed = new Set(allowInCallTypeArguments.map(stripWhitespace));
		/** @param {any} node */
		const isAllowed = (node) =>
			node?.type === 'TSVoidKeyword' &&
			node.parent.type === 'TSTypeParameterInstantiation' &&
			node.parent.parent.type === 'CallExpression' &&
			allowed.has(
				stripWhitespace(context.sourceCode.getText(node.parent.parent.callee)),
			);

		return baseRule.create(
			Object.create(context, {
				options: { value: [baseOptions] },
				report: {
					/** @param {import('eslint').Rule.ReportDescriptor} descriptor */
					value: (descriptor) => {
						if (!('node' in descriptor && isAllowed(descriptor.node))) {
							context.report(descriptor);
						}
					},
				},
			}),
		);
	},
};
