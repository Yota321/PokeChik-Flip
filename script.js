class FlipBook {
    constructor() {
        this.currentPage = 0;
        this.totalPages = 13; // 0: cover, 1-11: spreads, 12: back cover, 13: thank you
        this.isFlipping = false;
        
        this.flipbook = document.getElementById('flipbook');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.pageIndicator = document.getElementById('pageIndicator');
        
        this.coverPage = document.querySelector('.cover-page');
        this.spreads = document.querySelectorAll('.page-spread');
        this.backCoverPage = document.querySelector('.back-cover-page');
        this.thankYouPage = document.querySelector('.thank-you-page');
        
        this.init();
    }
    
    init() {
        this.updateDisplay();
        this.bindEvents();
        
        // Add click handlers for page flipping
        this.addClickHandlers();
    }
    
    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.previousPage());
        this.nextBtn.addEventListener('click', () => this.nextPage());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousPage();
            if (e.key === 'ArrowRight') this.nextPage();
        });
    }
    
    addClickHandlers() {
        // Click on right half to go next, left half to go previous
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
    }
    
    nextPage() {
        if (this.isFlipping || this.currentPage >= this.totalPages) return;
        
        this.isFlipping = true;
        this.currentPage++;
        
        this.animatePageFlip('next');
        
        setTimeout(() => {
            this.updateDisplay();
            this.isFlipping = false;
        }, 800);
    }
    
    previousPage() {
        if (this.isFlipping || this.currentPage <= 0) return;
        
        this.isFlipping = true;
        this.currentPage--;
        
        this.animatePageFlip('prev');
        
        setTimeout(() => {
            this.updateDisplay();
            this.isFlipping = false;
        }, 800);
    }
    
    animatePageFlip(direction) {
        const currentElement = this.getCurrentPageElement();
        
        if (currentElement) {
            currentElement.classList.add('flipping');
            
            setTimeout(() => {
                currentElement.classList.remove('flipping');
            }, 800);
        }
    }
    
    getCurrentPageElement() {
        if (this.currentPage === 0) return this.coverPage;
        if (this.currentPage >= 1 && this.currentPage <= 11) return this.spreads[this.currentPage - 1];
        if (this.currentPage === 12) return this.backCoverPage;
        if (this.currentPage === 13) return this.thankYouPage;
        return null;
    }
    
    updateDisplay() {
        // Reset all pages
        this.coverPage.classList.remove('active', 'flipped');
        this.spreads.forEach(spread => spread.classList.remove('active', 'flipped'));
        this.backCoverPage.classList.remove('active', 'flipped');
        this.thankYouPage.classList.remove('active');
        
        if (this.currentPage === 0) {
            // Show cover page
            this.coverPage.classList.add('active');
            this.updatePageIndicator('Cover');
        } else if (this.currentPage >= 1 && this.currentPage <= 11) {
            // Show page spread
            const spreadIndex = this.currentPage - 1;
            
            // Flip previous pages
            this.coverPage.classList.add('flipped');
            for (let i = 0; i < spreadIndex; i++) {
                this.spreads[i].classList.add('flipped');
            }
            
            // Show current spread
            this.spreads[spreadIndex].classList.add('active');
            
            const leftPageNum = (spreadIndex * 2) + 1;
            const rightPageNum = (spreadIndex * 2) + 2;
            this.updatePageIndicator(`Pages ${leftPageNum}-${rightPageNum}`);
        } else if (this.currentPage === 12) {
            // Show back cover
            this.coverPage.classList.add('flipped');
            this.spreads.forEach(spread => spread.classList.add('flipped'));
            this.backCoverPage.classList.add('active');
            this.updatePageIndicator('Back Cover');
        } else if (this.currentPage === 13) {
            // Show thank you page
            this.coverPage.classList.add('flipped');
            this.spreads.forEach(spread => spread.classList.add('flipped'));
            this.backCoverPage.classList.add('flipped');
            this.thankYouPage.classList.add('active');
            this.updatePageIndicator('Thank You');
        }
        
        // Update navigation buttons
        this.prevBtn.disabled = this.currentPage === 0;
        this.nextBtn.disabled = this.currentPage === this.totalPages;
    }
    
    updatePageIndicator(text) {
        this.pageIndicator.textContent = text;
    }
}

// Initialize the flipbook when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FlipBook();
    
    // Add loading animation
    const flipbook = document.getElementById('flipbook');
    flipbook.style.opacity = '0';
    flipbook.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
        flipbook.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        flipbook.style.opacity = '1';
        flipbook.style.transform = 'scale(1)';
    }, 100);
});

// Add touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        const flipbook = document.querySelector('.flipbook-container').__flipbook;
        if (flipbook) {
            if (diff > 0) {
                // Swipe left - next page
                flipbook.nextPage();
            } else {
                // Swipe right - previous page
                flipbook.previousPage();
            }
        }
    }
}

// Store flipbook instance globally for touch events
document.addEventListener('DOMContentLoaded', () => {
    const flipbookInstance = new FlipBook();
    document.querySelector('.flipbook-container').__flipbook = flipbookInstance;
});

