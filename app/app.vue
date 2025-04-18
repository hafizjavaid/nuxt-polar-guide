<template>
	<NuxtRouteAnnouncer />
	<NuxtLoadingIndicator color="#000000" />
	<UApp :toaster="{ position: 'top-center' }">
		<NuxtPage />
	</UApp>
</template>

<script lang="ts" setup>
</script>
