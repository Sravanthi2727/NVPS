 // Only scroll if needed
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        if (scrollPosition > 300) {
            const headerOffset = 100;
            const elementPosition = menuWrapper.offsetTop;
            const offsetPosition = elementPosition - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    
