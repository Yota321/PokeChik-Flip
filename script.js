class EnhancedFlipBook {
    constructor() {
        this.currentPage = 0;
        this.totalPages = 7; // 0: cover, 1-5: spreads, 6: back cover
        this.isFlipping = false;
        this.isOpened = false;
        this.musicPlaying = false;
        
        // DOM elements
        this.flipbook = document.getElementById('flipbook');
        this.flipbookContainer = document.getElementById('flipbookContainer');
        this.bookShadow = document.getElementById('bookShadow');
        this.bookSpine = document.getElementById('bookSpine');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.pageIndicator = document.getElementById('pageIndicator');
        this.progressFill = document.getElementById('progressFill');
        this.musicToggle = document.getElementById('musicToggle');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.controls = document.getElementById('controls');
        this.backgroundMusic = document.getElementById('backgroundMusic');
        
        this.pages = document.querySelectorAll('.page');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.setupMusic();
        this.addPageClickHandlers();
        this.setupKeyboardNavigation();
        this.setupTouchNavigation();
        
        // Initial book closed state
        this.setBookClosed();
        
        // Auto-open book after a short delay
        setTimeout(() => {
            this.openBook();
        }, 1000);
    }
    
    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.previousPage());
        this.nextBtn.addEventListener('click', () => this.nextPage());
        this.musicToggle.addEventListener('click', () => this.toggleMusic());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.restartBtn.addEventListener('click', () => this.restartBook());
        
        // Fullscreen change event
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
    }
    
    setupMusic() {
        this.backgroundMusic.volume = 0.3;
        
        // Try to play music (will be blocked by browser policy until user interaction)
        this.backgroundMusic.play().then(() => {
            this.musicPlaying = true;
            this.updateMusicButton();
        }).catch(() => {
            this.musicPlaying = false;
            this.updateMusicButton();
        });
    }
    
    toggleMusic() {
        if (this.musicPlaying) {
            this.backgroundMusic.pause();
            this.musicPlaying = false;
        } else {
            this.backgroundMusic.play().then(() => {
                this.musicPlaying = true;
            }).catch(console.error);
        }
        this.updateMusicButton();
    }
    
    updateMusicButton() {
        this.musicToggle.textContent = this.musicPlaying ? '🎵' : '🔇';
        this.musicToggle.classList.toggle('muted', !this.musicPlaying);
        this.musicToggle.title = this.musicPlaying ? 'Mute Music' : 'Play Music';
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(console.error);
        } else {
            document.exitFullscreen().catch(console.error);
        }
    }
    
    handleFullscreenChange() {
        const isFullscreen = !!document.fullscreenElement;
        document.body.classList.toggle('fullscreen-mode', isFullscreen);
        this.fullscreenBtn.textContent = isFullscreen ? '⛶' : '⛶';
        this.fullscreenBtn.title = isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen';
    }
    
    addPageClickHandlers() {
        this.flipbook.addEventListener('click', (e) => {
            if (this.isFlipping) return;
            
            const rect = this.flipbook.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const centerX = rect.width / 2;
            
            if (clickX > centerX) {
                this.nextPage();
            } else {
                this.previousPage();
            }
        });
        
        // Individual page hover effects
        this.pages.forEach(page => {
            page.addEventListener('mouseenter', () => {
                if (!this.isFlipping) {
                    page.style.transform += ' translateZ(5px)';
                }
            });
            
            page.addEventListener('mouseleave', () => {
                if (!this.isFlipping) {
                    page.style.transform = page.style.transform.replace(' translateZ(5px)', '');
                }
            });
        });
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousPage();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextPage();
                    break;
                case ' ':
                    e.preventDefault();
                    this.nextPage();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToPage(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToPage(this.totalPages - 1);
                    break;
                case 'Escape':
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    }
                    break;
            }
        });
    }
    
    setupTouchNavigation() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.flipbook.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        this.flipbook.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.nextPage();
                } else {
                    this.previousPage();
                }
            }
        };
        
        this.handleSwipe = handleSwipe;
    }
    
    setBookClosed() {
        this.flipbookContainer.classList.remove('opened');
        this.bookShadow.classList.remove('hidden');
        this.bookSpine.classList.remove('hidden');
        this.controls.style.opacity = '0.5';
        this.isOpened = false;
    }
    
    openBook() {
        this.flipbookContainer.classList.add('opened');
        this.bookShadow.classList.add('hidden');
        this.bookSpine.classList.add('hidden');
        this.controls.style.opacity = '1';
        this.isOpened = true;
        
        // Start music when book opens (if not already playing)
        if (!this.musicPlaying) {
            this.backgroundMusic.play().then(() => {
                this.musicPlaying = true;
                this.updateMusicButton();
            }).catch(() => {
                // Music blocked by browser policy
            });
        }
    }
    
    nextPage() {
        if (this.isFlipping) return;
        
        if (!this.isOpened) {
            this.openBook();
            return;
        }
        
        if (this.currentPage >= this.totalPages - 1) {
            // Already at the last page, show thank you
            return;
        }
        
        this.isFlipping = true;
        this.flipPage(this.currentPage, 'next');
        this.currentPage++;
        
        setTimeout(() => {
            this.updateDisplay();
            this.isFlipping = false;
        }, 1200);
    }
    
    previousPage() {
        if (this.isFlipping || this.currentPage <= 0) return;
        
        if (!this.isOpened) {
            this.openBook();
            return;
        }
        
        this.isFlipping = true;
        this.currentPage--;
        this.flipPage(this.currentPage, 'prev');
        
        setTimeout(() => {
            this.updateDisplay();
            this.isFlipping = false;
        }, 1200);
    }
    
    flipPage(pageIndex, direction) {
        const page = document.querySelector(`[data-page="${pageIndex}"]`);
        if (!page) return;
        
        page.classList.add('flipping');
        
        if (direction === 'next') {
            page.classList.add('flipped');
        } else {
            page.classList.remove('flipped');
        }
        
        // Add page flip sound effect (if you want to add sound)
        this.playFlipSound();
        
        setTimeout(() => {
            page.classList.remove('flipping');
        }, 1200);
    }
    
    playFlipSound() {
        // You can add a page flip sound effect here
        // const flipSound = new Audio('sounds/page-flip.mp3');
        // flipSound.volume = 0.3;
        // flipSound.play().catch(() => {});
    }
    
    goToPage(targetPage) {
        if (this.isFlipping || targetPage === this.currentPage) return;
        
        this.isFlipping = true;
        
        // Flip all pages between current and target
        if (targetPage > this.currentPage) {
            for (let i = this.currentPage; i < targetPage; i++) {
                setTimeout(() => {
                    this.flipPage(i, 'next');
                }, (i - this.currentPage) * 200);
            }
        } else {
            for (let i = this.currentPage - 1; i >= targetPage; i--) {
                setTimeout(() => {
                    this.flipPage(i, 'prev');
                }, (this.currentPage - 1 - i) * 200);
            }
        }
        
        this.currentPage = targetPage;
        
        setTimeout(() => {
            this.updateDisplay();
            this.isFlipping = false;
        }, Math.abs(targetPage - this.currentPage) * 200 + 1200);
    }
    
    restartBook() {
        this.goToPage(0);
        this.setBookClosed();
        
        setTimeout(() => {
            this.openBook();
        }, 500);
    }
    
    updateDisplay() {
        // Update page indicator
        if (this.currentPage === 0) {
            this.pageIndicator.textContent = 'Cover';
        } else if (this.currentPage === this.totalPages - 1) {
            this.pageIndicator.textContent = 'Back Cover';
        } else {
            // Calculate page numbers for spreads
            const leftPage = (this.currentPage - 1) * 4 + 1;
            const rightPage = leftPage + 1;
            this.pageIndicator.textContent = `Pages ${leftPage}-${rightPage}`;
        }
        
        // Update progress bar
        const progress = (this.currentPage / (this.totalPages - 1)) * 100;
        this.progressFill.style.width = `${progress}%`;
        
        // Update navigation buttons
        this.prevBtn.disabled = this.currentPage === 0;
        this.nextBtn.disabled = this.currentPage === this.totalPages - 1;
        
        // Update button text
        if (this.currentPage === this.totalPages - 1) {
            this.nextBtn.textContent = 'Finished';
        } else {
            this.nextBtn.textContent = 'Next →';
        }
    }
    
    // Public methods for external control
    getCurrentPage() {
        return this.currentPage;
    }
    
    getTotalPages() {
        return this.totalPages;
    }
    
    isBookOpened() {
        return this.isOpened;
    }
}

// Initialize the enhanced flipbook
document.addEventListener('DOMContentLoaded', () => {
    window.flipbook = new EnhancedFlipBook();
    
    // Add loading animation
    const flipbook = document.getElementById('flipbook');
    flipbook.style.opacity = '0';
    flipbook.style.transform = 'scale(0.8) rotateY(-30deg)';
    
    setTimeout(() => {
        flipbook.style.transition = 'opacity 1s ease, transform 1s ease';
        flipbook.style.opacity = '1';
        flipbook.style.transform = 'scale(1) rotateY(0deg)';
    }, 100);
    
    // Preload images for better performance
    const preloadImages = () => {
        for (let i = 0; i <= 23; i++) {
            const img = new Image();
            img.src = `images/${i}.png`;
        }
    };
    
    preloadImages();
});

// Handle page visibility change (pause music when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (window.flipbook && window.flipbook.backgroundMusic) {
        if (document.hidden) {
            window.flipbook.backgroundMusic.pause();
        } else if (window.flipbook.musicPlaying) {
            window.flipbook.backgroundMusic.play().catch(() => {});
        }
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    // Adjust flipbook size if needed
    if (window.flipbook) {
        // You can add responsive adjustments here
    }
});

// Prevent context menu on the flipbook for better UX
document.getElementById('flipbook').addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Add smooth scrolling for any internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

