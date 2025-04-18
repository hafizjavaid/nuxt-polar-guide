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
