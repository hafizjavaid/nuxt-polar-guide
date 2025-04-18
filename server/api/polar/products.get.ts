import { Polar } from "@polar-sh/sdk";

const { polarToken, polarServer } = useRuntimeConfig();

const polar = new Polar({
	accessToken: polarToken,
	server: polarServer as "sandbox" | "production",
});

export default defineEventHandler(async () => {
	try {
		const products = await polar.products.list({});
		return products;
	}
	catch (error) {
		console.log(error);
	}
});
