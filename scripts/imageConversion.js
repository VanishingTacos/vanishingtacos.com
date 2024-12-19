        // Image conversion logic
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const preview = document.getElementById('preview');
        const downloadBtn = document.getElementById('downloadBtn');
        const formatSelect = document.getElementById('formatSelect');
        const confirmationMsg = document.getElementById('confirmationMsg');
        let currentImage = null;

        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'white';
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = 'rgba(255, 255, 255, 0.5)';
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleImage(file);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                handleImage(e.target.files[0]);
            }
        });

        function handleImage(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.style.display = 'block';
                currentImage = e.target.result;
                downloadBtn.disabled = false;
                confirmationMsg.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }

        downloadBtn.addEventListener('click', () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                const format = formatSelect.value;
                const mimeType = `image/${format}`;
                const convertedImage = canvas.toDataURL(mimeType);
                
                const link = document.createElement('a');
                link.download = `converted.${format}`;
                link.href = convertedImage;
                link.click();
                
                confirmationMsg.style.display = 'block';
                setTimeout(() => {
                    confirmationMsg.style.display = 'none';
                }, 3000); // Hide message after 3 seconds
            };
            img.src = currentImage;
        });