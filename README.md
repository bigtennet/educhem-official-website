# EduChem with Ajibola - Website

Complete website structure for EduChem with Ajibola - Making Chemistry Exciting Again!

## 📁 File Structure

```
educhem-site/
├── index.html          # Home page
├── about.html          # About page
├── resources.html      # Resources page
├── contact.html        # Contact page
├── css/
│   └── style.css      # Main stylesheet
├── js/
│   └── script.js       # JavaScript functionality
└── README.md           # This file
```

## 🚀 Installation Instructions

Since the target directory requires root permissions, follow these steps:

### Option 1: Using sudo (Recommended)

```bash
# Copy all files to the target directory
sudo cp -r /tmp/educhem-site/* /opt/lampp/htdocs/educhem-with-ajibola/

# Set proper permissions
sudo chown -R www-data:www-data /opt/lampp/htdocs/educhem-with-ajibola
sudo chmod -R 755 /opt/lampp/htdocs/educhem-with-ajibola
```

### Option 2: Manual Copy

1. Navigate to the temporary directory:
   ```bash
   cd /tmp/educhem-site
   ```

2. Copy files manually using your file manager or terminal with sudo

3. Ensure proper permissions are set

## ✨ Features

- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Modern UI**: Clean, professional design with white and light blue theme
- **SEO Optimized**: Meta tags and keywords for better search engine visibility
- **Interactive Elements**: 
  - Mobile-friendly navigation menu
  - Search and filter functionality on resources page
  - Contact and newsletter forms
  - Smooth scrolling animations
- **Complete Content**: All pages include full copy and content as specified

## 📄 Pages Overview

### Home Page (index.html)
- Hero section with tagline and CTAs
- Features section (6 key benefits)
- Testimonials from students
- Newsletter subscription form
- Footer with social links

### About Page (about.html)
- Story of EduChem
- Founder bio (Ajibola Machado)
- Mission and Vision sections
- Core values
- Inspirational quote

### Resources Page (resources.html)
- Search functionality
- Filter by resource type
- Four categories:
  - PDF Lesson Notes
  - Exam Prep Materials (WAEC, JAMB, SSCE)
  - Tutorials/Slides
  - Educational Infographics
- Download buttons for each resource

### Contact Page (contact.html)
- Contact information (phone, email, WhatsApp)
- Social media links
- Contact form
- FAQ section

## 🎨 Design Features

- **Color Scheme**: White background with light blue accents (#1e88e5 primary, #00acc1 secondary)
- **Typography**: Poppins font family (Google Fonts)
- **Icons**: Font Awesome 6.4.0
- **Animations**: Smooth fade-in and scroll animations
- **Responsive Breakpoints**: 
  - Desktop: 1200px+
  - Tablet: 768px - 1199px
  - Mobile: < 768px

## 🔧 Customization

### Adding Real Images

Replace placeholder images by:
1. Adding images to `assets/images/` folder
2. Updating HTML to reference actual image paths
3. Example: `<img src="assets/images/hero-bg.jpg" alt="Chemistry Lab">`

### Updating Contact Information

All contact details are in the HTML files. Search for:
- Phone: 09063146614
- Email: educhemwithajibola@gmail.com
- Social media links

### Adding Real Resources

Update the resources page by:
1. Adding actual PDF/PPTX files
2. Updating download links in `resources.html`
3. Adjusting file sizes and metadata

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security Notes

- Forms currently show alerts (client-side only)
- For production, implement proper backend form handling
- Add CSRF protection for forms
- Validate and sanitize all user inputs

## 📝 Next Steps

1. Move files to web server directory
2. Add real images and videos
3. Upload actual resource files
4. Set up backend for form submissions
5. Configure email service for newsletter
6. Add Google Analytics (optional)
7. Set up SSL certificate for HTTPS

## 📞 Support

For questions or issues, contact:
- Email: educhemwithajibola@gmail.com
- Phone: 09063146614

---

**Built with ❤️ for EduChem with Ajibola**

Making Chemistry Exciting Again! 🧪

