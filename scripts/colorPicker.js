document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    const canvasContainer = document.querySelector('.canvas-container');
    const colorPreview = document.querySelector('.color-preview');
    const hexValue = document.getElementById('hexValue');
    const rgbValue = document.getElementById('rgbValue');
    const copyButtons = document.querySelectorAll('.copy-btn');
    const zoomIn = document.getElementById('zoomIn');
    const zoomOut = document.getElementById('zoomOut');
    const resetZoom = document.getElementById('resetZoom');
    const zoomLevel = document.getElementById('zoomLevel');
    const canvasWrapper = document.querySelector('.canvas-wrapper');
    
    let currentZoom = 1;
    const ZOOM_STEP = 0.1;
    const MAX_ZOOM = 5;
    const MIN_ZOOM = 0.1;
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;
    let zoomInterval = null;
    const ZOOM_INTERVAL_DELAY = 50; // How often to zoom while holding (in milliseconds)

    function updateCanvasScale() {
        canvas.style.transform = `scale(${currentZoom})`;
        canvas.style.transformOrigin = 'top left';
        zoomLevel.textContent = `${Math.round(currentZoom * 100)}%`;
        
        // Reset scroll position when resetting zoom
        if (currentZoom === 1) {
            canvasWrapper.scrollLeft = 0;
            canvasWrapper.scrollTop = 0;
        }
    }

    // Helper function to handle zooming
    function handleZoom(isZoomIn) {
        if (isZoomIn && currentZoom < MAX_ZOOM) {
            currentZoom = Math.min(currentZoom + ZOOM_STEP, MAX_ZOOM);
            updateCanvasScale();
        } else if (!isZoomIn && currentZoom > MIN_ZOOM) {
            currentZoom = Math.max(currentZoom - ZOOM_STEP, MIN_ZOOM);
            updateCanvasScale();
        }
    }

    // Zoom In button
    zoomIn.addEventListener('mousedown', () => {
        handleZoom(true);
        zoomInterval = setInterval(() => handleZoom(true), ZOOM_INTERVAL_DELAY);
    });

    // Zoom Out button
    zoomOut.addEventListener('mousedown', () => {
        handleZoom(false);
        zoomInterval = setInterval(() => handleZoom(false), ZOOM_INTERVAL_DELAY);
    });

    // Clear interval when mouse is released or leaves the button
    [zoomIn, zoomOut].forEach(button => {
        button.addEventListener('mouseup', () => {
            clearInterval(zoomInterval);
        });
        button.addEventListener('mouseleave', () => {
            clearInterval(zoomInterval);
        });
    });

    // Handle touch events for mobile devices
    [zoomIn, zoomOut].forEach(button => {
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleZoom(button === zoomIn);
            zoomInterval = setInterval(() => handleZoom(button === zoomIn), ZOOM_INTERVAL_DELAY);
        });
        
        button.addEventListener('touchend', () => {
            clearInterval(zoomInterval);
        });
        
        button.addEventListener('touchcancel', () => {
            clearInterval(zoomInterval);
        });
    });

    // Add wheel zoom support
    canvas.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            const newZoom = currentZoom + delta;
            
            if (newZoom >= MIN_ZOOM && newZoom <= MAX_ZOOM) {
                currentZoom = newZoom;
                updateCanvasScale();
            }
        }
    });

    // Handle drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#61dafb';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'rgba(255, 255, 255, 0.5)';
        const file = e.dataTransfer.files[0];
        handleImage(file);
    });

    // Handle click to upload
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleImage(file);
    });

    function handleImage(file) {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Set canvas size to match image dimensions
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                dropZone.style.display = 'none';
                canvasContainer.style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Handle color picking
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Scale coordinates to actual canvas size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
        const color = {
            r: pixel[0],
            g: pixel[1],
            b: pixel[2]
        };

        updateColorDisplay(color);
    });

    function updateColorDisplay(color) {
        const hex = rgbToHex(color.r, color.g, color.b);
        const rgb = `rgb(${color.r}, ${color.g}, ${color.b})`;
        
        colorPreview.style.backgroundColor = rgb;
        hexValue.textContent = hex;
        rgbValue.textContent = rgb;
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    // Add copy button functionality
    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const type = button.dataset.value;
            const value = type === 'hex' ? hexValue.textContent : rgbValue.textContent;
            
            try {
                await navigator.clipboard.writeText(value);
                
                // Show confirmation message
                const confirmSpan = button.nextElementSibling;
                confirmSpan.style.opacity = '1';
                
                // Hide confirmation after 2 seconds
                setTimeout(() => {
                    confirmSpan.style.opacity = '0';
                }, 3000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    });

    // Add drag functionality
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        canvas.style.cursor = 'grabbing';
        
        startX = e.pageX - canvasWrapper.offsetLeft;
        startY = e.pageY - canvasWrapper.offsetTop;
        scrollLeft = canvasWrapper.scrollLeft;
        scrollTop = canvasWrapper.scrollTop;
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
        canvas.style.cursor = 'crosshair';
    });

    canvas.addEventListener('mouseup', (e) => {
        if (isDragging) {
            isDragging = false;
            canvas.style.cursor = 'crosshair';
            
            // If the mouse hasn't moved much, treat it as a click for color picking
            const movedX = Math.abs(e.pageX - canvasWrapper.offsetLeft - startX);
            const movedY = Math.abs(e.pageY - canvasWrapper.offsetTop - startY);
            
            if (movedX < 5 && movedY < 5) {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) / currentZoom;
                const y = (e.clientY - rect.top) / currentZoom;
                
                const scaleX = canvas.width / (rect.width / currentZoom);
                const scaleY = canvas.height / (rect.height / currentZoom);
                
                const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
                const color = {
                    r: pixel[0],
                    g: pixel[1],
                    b: pixel[2]
                };
                updateColorDisplay(color);
            }
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        e.preventDefault();
        
        const x = e.pageX - canvasWrapper.offsetLeft;
        const y = e.pageY - canvasWrapper.offsetTop;
        
        const moveX = (x - startX);
        const moveY = (y - startY);
        
        canvasWrapper.scrollLeft = scrollLeft - moveX;
        canvasWrapper.scrollTop = scrollTop - moveY;
    });

    // Update cursor style
    canvas.style.cursor = 'crosshair';

    // Remove the old click event listener and replace with the mouseup handler above
    canvas.removeEventListener('click', null);

    // Update reset zoom button handler
    resetZoom.addEventListener('mousedown', () => {
        clearInterval(zoomInterval); // Clear any existing zoom intervals
        currentZoom = 1;
        updateCanvasScale();
    });
}); 