# Polar Nuxt Example App

This repository demonstrates how you can setup Polar with Nuxt with ease. [Read the Polar Nuxt integration guide for more information.](https://docs.polar.sh/documentation/integration-guides/nuxt)

This repository covers the following concepts:

- Rendering Polar Products
- Redirection to a generated Checkout session
- Capturing Webhook events for reconcilation with your database

---
title: "Integrate Polar with Nuxt"
sidebarTitle: "Nuxt"
description: "In this guide, we'll show you how to integrate Polar with Nuxt"
---


Consider following this guide while using the Polar Sandbox Environment. This will allow you to test your integration without affecting your production data.

[A complete code-example of this guide can be found on GitHub](https://github.com/hafizjavaid/nuxt-polar-guide).

Install the Polar JavaScript SDK
---------------------------------------

To get started, you need to install the Polar JavaScript SDK and the Polar Nuxt helper package. You can do this by running the following command:

```bash
pnpm add @polar-sh/nuxt @polar-sh/sdk
```

```bash
export default defineNuxtConfig({
  modules: ["@polar-sh/nuxt"],
});
```

Setting up environment variables
---------------------------------------

### Polar Access Token

To authenticate with Polar, you need create an access token, and supply it to Nuxt using a `NUXT_POLAR_TOKEN` environment variable.

```bash
export default defineNuxtConfig({
   runtimeConfig: {
    polarToken: '',
  }
});
```

You can create an organization access token from your organization settings.

Configuring a Polar API Client
-------------------------------------

To interact with the Polar API, you need to create a new instance of the `Polar` class. This class uses the provided access token to authenticate with the Polar API.

```typescript
// server/api/polar.ts
import { Polar } from '@polar-sh/sdk'

const { polarToken } = useRuntimeConfig()

export const api = new Polar({
  accessToken: polarToken,
  server: 'sandbox', // Use this option if you're using the sandbox environment - else use 'production' or omit the parameter
})
```

Remember to replace `sandbox` with `production` when you're ready to switch to the production environment.

Fetching Polar Products for display
------------------------------------------

Fetching products using the Polar API is simple using the `polar.products.list` method. This method returns a list of products that are associated with the organization.

```typescript
// server/api/polar/products.get.ts
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

```
### Displaying Products

Let's create a simple server-side rendered page that fetches products from Polar and displays them.

```vue
<!-- pages/index.vue -->
<template>
	<UContainer class="mt-10">
		<div class="flex flex-col gap-y-4">
			<h1 class="text-5xl">
				Products
			</h1>
			<div v-if="status == 'pending'">
				<div class="grid grid-cols-4 gap-12">
					<UCard
						v-for="n in 4"
						:key="n"
						class="w-full"
					>
						<template #header>
							<USkeleton class="h-4 w-[250px]" />
						</template>
						<USkeleton class="h-32 w-full" />
						<template #footer>
							<USkeleton class="h-12 w-[150px]" />
						</template>
					</UCard>
				</div>
			</div>
			<template v-else>
				<div class="grid grid-cols-4 gap-12">
					<UCard
						v-for="product in data?.result.items"
						:key="product.id"
					>
						<template #header>
							<h1>{{ product.name }}</h1>
						</template>
						<AppPlaceholder class="h-32" />
						<template #footer>
							<UButton
								color="neutral"
								class="cursor-pointer"
								@click="purchaseProduct(product.id)"
							>
								Buy Product
							</UButton>
						</template>
					</UCard>
				</div>
			</template>
		</div>
	</UContainer>
</template>

<script setup lang="ts">
const { data, status } = await useFetch("/api/polar/products", {
	lazy: true,
});

const purchaseProduct = async (productId: string) => {
	try {
		const res = await $fetch("/api/checkout", {
			method: "POST",
			body: {
				productId,
			},
		});

		if (res.url) {
			window.location.href = res.url;
		}
	}
	catch (error) {
		console.log(error);
	}
};
</script>

<style scoped></style>

```

Generating Polar Checkout Sessions
-----------------------------------------

Next up, we need to create a checkout endpoint to handle the creation of checkout sessions. This endpoint will be responsible for creating a new checkout session, redirecting the user to the Polar Checkout page & redirect back to a configured confirmation page.

Go ahead and create a new POST route in Nuxt.

```typescript
// server/api/checkout/index.post.ts
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

```

We can now easily create a checkout session & redirect there by creating a link to `purchaseProduct(product.id)`. Just like we did in the `pages/index.vue` code.

Handling the Confirmation Page
-------------------------------------

Create a new page in Nuxt to handle the success page. This is where the user will be redirected to after the Polar checkout session is done & checkout is confirmed.

```vue
<!-- pages/confirm.vue -->
<template>
	<div>
		Thank you! Your checkout is now being processed.
	</div>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>

```



The checkout is not considered "successful" yet however. It's initially marked as `confirmed` until you've received a webhook event `checkout.updated` with a status set to `succeeded`. We'll cover this in the next section.



Handling Polar Webhooks
------------------------------

Polar can send you events about various things happening in your organization. This is very useful for keeping your database in sync with Polar checkouts, orders, subscriptions, etc.

Configuring a webhook is simple. Head over to your organization's settings page and click on the "Add Endpoint" button to create a new webhook.

### Tunneling webhook events to your local development environment

If you're developing locally, you can use a tool like [ngrok](https://ngrok.com/) to tunnel webhook events to your local development environment. This will allow you to test your webhook handlers without deploying them to a live server.

Run the following command to start an ngrok tunnel:

```bash
ngrok http 3000 OR ngrok http 3000 --response-header-add "Access-Control-Allow-Origin: *" --host-header rewrite
```
### Add Webhook Endpoint

1. Point the Webhook to `your-app.com/api/webhook/polar`. This must be an absolute URL which Polar can reach. If you use ngrok, the URL will look something like this: `https://<your-ngrok-id>.ngrok-free.app/api/webhook/polar`.
2. Select which events you want to be notified about. You can read more about the available events in the [Events section](/api-reference#webhooks).
3. Generate a secret key to sign the requests. This will allow you to verify that the requests are truly coming from Polar.
4. Add the secret key to your environment variables.

```bash
# .env
NUXT_PUBLIC_BASE_URL=""

NUXT_POLAR_TOKEN=""
NUXT_POLAR_SERVER="sandbox"
NUXT_POLAR_WEBHOOK_SECRET=""
```
### Setting up the Webhook handler

```typescript
// server/api/checkout/webhook.ts
export default defineEventHandler(async (event) => {
	const { polarWebhookSecret } = useRuntimeConfig();
	const webhooksHandler = Webhooks({
		webhookSecret: polarWebhookSecret,
		onPayload: async (payload) =>
	});
});

```

The webhook event is now verified and you can proceed to handle the payload data.

### Handling Webhook Events

Depending on which events you've subscribed to, you'll receive different payloads. This is where you can update your database, send notifications, etc.

```typescript
// server/api/checkout/webhook.ts
export default defineEventHandler(async (event) => {
	const { polarWebhookSecret } = useRuntimeConfig();
	const webhooksHandler = Webhooks({
		webhookSecret: polarWebhookSecret,
		onPayload: async (payload) => {
			switch (payload.type) {
				case "checkout.created":
					console.log(payload.data);
					// Handle the checkout created event
					// supabase.from('checkouts').insert(payload.data)
					break;
				case "checkout.updated":
					console.log(payload.data);
					// Handle the checkout updated event
					// supabase.from('checkouts').update(payload.data).match({ id: payload.data.id })
					break;
				case "subscription.created":
					// console.log(payload.data);
					// Handle the subscription created event
					break;
				case "subscription.updated":
					// console.log(payload.data);
					// Handle the subscription updated event
					break;
				case "subscription.active":
					// console.log(payload.data);
					// Handle the subscription active event
					break;
				case "subscription.revoked":
					// console.log(payload.data);
					// Handle the subscription revoked event
					break;
				case "subscription.canceled":
					// console.log(payload.data);
					// Handle the subscription canceled event
					break;
				case "order.paid":
					console.log(payload.data);
					break;

				// Most Important and the only webhook ( in 90% cases )
				case "customer.state_changed":
					console.log(payload.data);
					break;
				default:
					// Handle unknown event
					console.log("Unknown event", payload.type);
					break;
			}
		},
	});
	return webhooksHandler(event);
});

```

If you're keeping track of active and inactive subscriptions in your database, make sure to handle the `subscription.active` and `subscription.revoked` events accordingly.

The cancellation of a subscription is handled by the `subscription.canceled` event. The user has probably canceled their subscription before the end of the billing period. Do not revoke any kind of access immediately, but rather wait until the end of the billing period or when you receive the `subscription.revoked` event.


### Notifying the client about the event

If you're building a real-time application, you might want to notify the client about the event. On the confirmation-page, you can listen for the `checkout.updated` event and update the UI accordingly when it reaches the succeeded status.

Conclusion
-----------------

[A complete code-example of this guide can be found on GitHub](https://github.com/hafizjavaid/nuxt-polar-guide).

If you have issues or need support, feel free to join [our Discord](https://discord.gg/Pnhfz3UThd).

