import { Polar } from "@polar-sh/sdk";

export default defineEventHandler(async (event) => {
	const { polarToken, polarServer, public: { baseUrl } } = useRuntimeConfig();

	const { productId } = await readBody<{ productId: string }>(event);

	const polar = new Polar({
		accessToken: polarToken,
		server: polarServer as "sandbox" | "production",
	});

	const res = await polar.checkouts.create({
		products: [productId],
		successUrl: `${baseUrl}`,
	});
	return res;
});
