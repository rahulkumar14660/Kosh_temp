# Kosh Enterprise Resource Platform

A comprehensive, unified platform designed to manage your enterprise’s intellectual assets, physical inventory, employee lifecycle, and audit trails — all in one place.

<section>
  <h2>📘 About The Project</h2>
  <p>
    Most enterprises struggle with fragmented systems for managing physical inventory, intellectual resources, employee data, and compliance logs — leading to silos, inefficiencies, and operational risks.
  </p>
  <p>
    <strong>Kosh</strong> breaks these silos by offering a <strong>single, intelligent, and secure enterprise platform</strong> that unifies operations through the following innovations:
  </p>
  <ul>
    <li>
      <strong>🤖 AI-Powered Conversational Assistant:</strong> Built on <em>Gemini 2.5 Flash</em>, Kosh features an in-platform, role-aware LLM assistant that enables users to perform complex operations using natural language. Whether it's “Assign Mahabharata to Mehul” or “Onboard a new employee named Riya,” the assistant securely executes backend actions based on user permissions — making enterprise workflows fast, intuitive, and conversational.
    </li>
    <li>
      <strong>🔐 Role-Based Access Control (RBAC):</strong> Multiple distinct user roles — Admin, Librarian, Asset Manager, HR, and Employee — each with tightly scoped permissions enforced via middleware on both backend and frontend. This ensures robust access control and enterprise-grade security.
    </li>
    <li>
      <strong>📦 Modular Enterprise Systems:</strong> Includes scalable modules for <em>Library Management</em>, <em>Asset Management</em>, <em>Employee Lifecycle</em>, and <em>Audit Trails</em> — built on clean MVC architecture. Each user sees only what’s relevant to their role, improving security and usability.
    </li>
    <li>
      <strong>🔍 Intelligent Search and Filtering:</strong> Every module supports client-side search and filtering, enabling lightning-fast record lookups across books, assets, and personnel.
    </li>
    <li>
      <strong>🛡️ Secure Authentication Flow:</strong> Implements JWT-based session management with HTTP-only cookies. OTP-based email verification is integrated for new user onboarding and secure password management.
    </li>
    <li>
      <strong>📊 Transparent Audit Trails:</strong> All major actions — like book borrowings, asset assignments, and employee updates — are logged and accessible in a paginated audit dashboard to ensure traceability and compliance.
    </li>
    <li>
      <strong>🚀 Fully Deployable:</strong> Frontend is hosted on <em>Netlify</em>, and backend on <em>Render</em>, showcasing a real-world, production-ready full-stack deployment.
    </li>
  </ul>
</section>


<section>
  <h2>🚀 Live Demo</h2>

  <h3>🧪 Demo Login Credentials (Required)</h3>
  <p><strong>Note:</strong> The demo database resets daily at <strong>10:00 AM (server time)</strong>. Any data changes will be lost after the reset.</p>

  <ul>
    <li><strong>Email:</strong> demo.kosh@yopmail.com</li>
    <li><strong>Password:</strong> demo@kosh</li>
  </ul>

  <h3>🌐 Access the Live Demo</h3>
  <ul>
    <li>
      <strong>Frontend (Netlify):</strong>
      <a href="https://kosh-erp.netlify.app" target="_blank" rel="noopener">
        https://kosh-erp.netlify.app
      </a>
    </li>
    <li>
      <strong>Backend (Render):</strong>
      <a href="https://kosh-erp.onrender.com" target="_blank" rel="noopener">
        https://kosh-erp.onrender.com
      </a>
    </li>
  </ul>
</section>


<section>
  <h2>✨ Key Features</h2>

  <h3>Platform-Wide</h3>
  <ul>
    <li><strong>Multi-Role Access:</strong> Supports Admin, Librarian, Asset Manager, HR, and Employee with fine-grained permissions.</li>
    <li><strong>Secure JWT Authentication:</strong> Robust session management with HTTP-only cookies and OTP-based verification.</li>
    <li><strong>Audit Logs:</strong> Comprehensive logging of platform activities with paginated audit views.</li>
    <li><strong>File Uploads:</strong> Multer + Cloudinary integration for secure and scalable media handling.</li>
    <li><strong>LLM-Powered Contextual Assistant:</strong> Interactive AI assistant enabling users to perform system operations via natural language, with role-based authorization and secure action execution.</li>
    <li><strong>Modular UI:</strong> Dynamic dashboards showing module cards per user role.</li>
    <li><strong>Search & Filter:</strong> Client-side search & filter across all modules.</li>
    <li><strong>Graphical Dashboards:</strong> Visual reports and analytics for Library and Asset Management modules.</li>
  </ul>

  <h3>Modules</h3>
  <ul>
    <li><strong>Library Management:</strong> Manage corporate books, borrowing records, and inventory.</li>
    <li><strong>Asset Management:</strong> Track physical assets with assignment and status tracking.</li>
    <li><strong>Employee Lifecycle:</strong> Automate onboarding, updates, and offboarding processes.</li>
    <li><strong>Audit Trails & Compliance:</strong> Full visibility into system activities for security and accountability.</li>
  </ul>
</section>

<section>
  <h2>🧰 Technology Stack</h2>
  <ul>
    <li><strong>Frontend:</strong> React.js (Vite), Tailwind CSS, Axios, React Context API</li>
    <li><strong>Backend:</strong> Node.js, Express.js, JWT, Multer, Nodemailer, Cloudinary</li>
    <li><strong>Database:</strong> MongoDB with Mongoose ODM</li>
    <li><strong>Hosting:</strong> Netlify (frontend), Render (backend)</li>
  </ul>
</section>

<section>
  <h2>⚙️ Local Development Setup</h2>

  <h3>Prerequisites</h3>
  <ul>
    <li>Node.js (v14+)</li>
    <li>npm or yarn</li>
    <li>Git</li>
  </ul>

  <h3>Installation</h3>
  <pre><code>git clone https://github.com/your-username/kosh.git
cd kosh
</code></pre>

  <h4>Setup Backend</h4>
  <pre><code>cd server
npm install
# Add your .env file here (see Environment Variables below)
npm start
</code></pre>

  <h4>Setup Frontend</h4>
  <pre><code>cd ../client
npm install
# Add your .env file here (see Environment Variables below)
npm run dev
</code></pre>

  <p>The app should be running at <a href="http://localhost:5173" target="_blank" rel="noopener">http://localhost:5173</a></p>
</section>

<section>
  <h2>🔐 Environment Variables</h2>

  <h3>Backend (<code>server/.env</code>)</h3>
  <ul>
    <li><code>PORT=5000</code></li>
    <li><code>MONGO_URI=your_mongodb_connection_string</code></li>
    <li><code>JWT_SECRET=a_very_strong_and_long_random_secret_key</code></li>
    <li><code>FRONTEND_URL=http://localhost:5173</code></li>
    <li><code>CLOUDINARY_CLIENT_NAME=your_cloudinary_cloud_name</code></li>
    <li><code>CLOUDINARY_CLIENT_API=your_cloudinary_api_key</code></li>
    <li><code>CLOUDINARY_CLIENT_SECRET=your_cloudinary_api_secret</code></li>
    <li><code>EMAIL_HOST=smtp.gmail.com</code></li>
    <li><code>EMAIL_USER=your_app_email@gmail.com</code></li>
    <li><code>EMAIL_PASS=your_gmail_app_password</code></li>
  </ul>

  <h3>Frontend (<code>client/.env</code>)</h3>
  <ul>
    <li><code>VITE_API_URL</code></li>
  </ul>
</section>

<section>
  <h2>🤝 Contributing</h2>
  <p>Contributions are what make the open-source community amazing 💙</p>
  <p>To contribute:</p>
  <ol>
    <li>Fork the repo</li>
    <li>Create your feature branch (<code>git checkout -b feature/AmazingFeature</code>)</li>
    <li>Commit your changes (<code>git commit -m 'feat: Add some AmazingFeature'</code>)</li>
    <li>Push to the branch (<code>git push origin feature/AmazingFeature</code>)</li>
    <li>Open a Pull Request</li>
  </ol>
  <p>Or open an issue tagged with enhancement.</p>
</section>

<section>
  <h2>💡 Technical Highlights</h2>
  <ul>
    <li><strong>Role-Based Access Control (RBAC):</strong> Middleware guards restrict API routes and frontend views by user role, supporting Admin, Librarian, Asset Manager, HR, and Employee with fine-grained permission control.</li>
    <li><strong>Secure Authentication:</strong> JWT tokens stored securely in HTTP-only cookies; email OTPs for new user onboarding and password management.</li>
    <li><strong>Audit Trails:</strong> All major user actions are logged and accessible in paginated audit dashboards, ensuring compliance and traceability.</li>
    <li><strong>File Uploads:</strong> Multer and Cloudinary enable secure and scalable image/document uploads.</li>
    <li><strong>Modular MVC Architecture:</strong> Clean separation of concerns for scalability and maintainability.</li>
    <li><strong>Dynamic Dashboards:</strong> Users see only relevant modules and reports based on their roles, improving usability.</li>
    <li><strong>Search & Filter:</strong> Responsive client-side filtering across all data sets for quick lookups.</li>
    <li><strong>Graphical Analytics:</strong> Dashboards with graphs for Library and Asset Management for data-driven insights.</li>
  </ul>
</section>

<section>
  <h2>🤖 LLM-Powered Contextual Assistant <span style="font-weight: normal;">(Powered by Gemini 2.5 Flash)</span></h2>
  <ul>
    <li><strong>🔐 Role-Aware Intelligence:</strong> The assistant intelligently adapts responses and actions based on the user's role (Admin, HR, Librarian, Asset Manager, or Employee), ensuring strict RBAC compliance.</li>
    <li><strong>⚡ Powered by Gemini 2.5 Flash:</strong> Leverages Google's Gemini 2.5 Flash for fast, reliable, and contextually rich natural language understanding.</li>
    <li><strong>🗣️ Natural Language Commands:</strong> Perform actions like assigning assets, managing books, or updating employee data using conversational prompts — no form-filling required.</li>
    <li><strong>🛡️ Secure & Controlled Execution:</strong> Each response is filtered through structured system prompts and permission checks, preventing unauthorized operations.</li>
    <li><strong>🧭 Multi-Step Guidance & Automation:</strong> Supports guided workflows and can execute multiple intents in one command, such as “Assign Mahabharata to Mehul and mark him on leave.”</li>
    <li><strong>💬 Conversational Memory:</strong> Remembers recent context to handle follow-up queries like disambiguating users or continuing multi-step tasks.</li>
    <li><strong>🚀 Enhances User Experience:</strong> Simplifies onboarding, reduces support needs, and enables all roles to interact with the system intuitively.</li>
  </ul>
</section>



<section>
  <h2>🛠️ Challenges & Learnings</h2>
  <ul>
    <li>Implementing <strong>file uploads</strong> with Multer and integrating Cloudinary was challenging but crucial for handling media securely and efficiently.</li>
    <li>Building <strong>multi-role access</strong> deepened my understanding of secure design patterns and real-world enterprise authorization.</li>
    <li>Designing a comprehensive <strong>audit logging system</strong> reinforced the importance of compliance and operational transparency.</li>
    <li>Deploying frontend and backend on separate platforms enhanced my full-stack deployment and environment management skills.</li>
  </ul>
</section>

<section>
  <h2>📄 License</h2>
  <p>Distributed under the MIT License. See <code>LICENSE</code> for more information.</p>
</section>

<section>
  <h2>📬 Contact</h2>
  <ul>
    <li><strong>Prakhar Singhal</strong></li>
    <li>LinkedIn: <a href="https://linkedin.com/in/prakhar-singhal-ln" target="_blank" rel="noopener">linkedin.com/in/prakhar-singhal-ln</a></li>
    <li>Email: <a href="mailto:prakharsinghalrishu@gmail.com">prakharsinghalrishu@gmail.com</a></li>
    <li>GitHub: <a href="https://github.com/PrakharSinghal07/Kosh" target="_blank" rel="noopener">github.com/PrakharSinghal07/Kosh</a></li>
  </ul>
</section>

<footer>
  <p>✨ Built with love and purpose to unify enterprise knowledge and asset management.</p>
</footer>

