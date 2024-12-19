        // Create bubbles animation
        document.addEventListener('DOMContentLoaded', () => {
            for (let i = 0; i < 100; i++) {
                const bubble = document.createElement('div');
                bubble.classList.add('bubble');
                bubble.style.setProperty('--random-x', Math.random());
                bubble.style.setProperty('--random-y', Math.random());
                bubble.style.setProperty('--random-direction', Math.random() > 0.5 ? 1 : -1);
                document.body.appendChild(bubble);
            }
        });