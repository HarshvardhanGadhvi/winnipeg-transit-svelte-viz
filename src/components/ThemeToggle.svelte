<script>
    import { onMount } from 'svelte';
    import { Sun, Moon } from 'lucide-svelte';

    let isDark = false;

    onMount(() => {
        // Check local storage or system preference
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            isDark = true;
            document.documentElement.classList.add('dark');
        } else {
            isDark = false;
            document.documentElement.classList.remove('dark');
        }
    });

    function toggleTheme() {
        isDark = !isDark;
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }
</script>

<button 
    on:click={toggleTheme}
    class="p-2 rounded-full transition-all duration-300 border border-transparent hover:bg-[var(--bg-glass)] hover:border-[var(--border-subtle)]"
    aria-label="Toggle Dark Mode"
>
    {#if isDark}
        <Moon size={20} class="text-[var(--color-brand-400)] fill-[var(--color-brand-400)]/20" />
    {:else}
        <Sun size={20} class="text-amber-500 fill-amber-500/20" />
    {/if}
</button>