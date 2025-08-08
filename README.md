# Navejo - Bookmarking Workspace for Frontend Engineers & Designers

A powerful bookmarking workspace built for frontend engineers and designers. Collect, organize, and share your most valuable links — all in one place.

## Features

### 🏢 Workspace Management
- **Create Organizations & Workspaces**: Set up dedicated spaces for different teams or projects
- **Role-based Access Control**: Owner, Admin, Member, and Viewer roles with appropriate permissions
- **Smart Organization**: Automatically categorize your bookmarks with folders and tags

### 👥 Team Collaboration
- **Invite Team Members**: Send email invitations with role assignments
- **Shared Collections**: Collaborate on research projects and share resources
- **Real-time Sync**: Keep everyone updated with the latest bookmarks and changes
- **Permission Controls**: Fine-grained access control for sensitive resources

### 📚 Bookmark Organization
- **Folders & Collections**: Organize bookmarks in nested folder structures
- **Tags & Labels**: Add multiple tags for better categorization
- **Search & Filter**: Quickly find bookmarks with powerful search capabilities
- **Favorites & Archives**: Mark important bookmarks and archive old ones

### 🔗 Sharing & Discovery
- **Public Sharing**: Share bookmark collections with public links
- **Team Discovery**: Discover new resources shared by team members
- **Export Options**: Export bookmarks in various formats

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- SMTP server for email invitations

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd navejo-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Configure the following variables in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `SMTP_*`: Email server configuration for invitations
- `GOOGLE_CLIENT_ID/SECRET`: Google OAuth credentials
- `GITHUB_CLIENT_ID/SECRET`: GitHub OAuth credentials

4. Set up the database:
```bash
pnpm prisma generate
pnpm prisma db push
```

5. Start the development server:
```bash
pnpm dev
```

## Workspace Features

### Creating Workspaces
1. Click "Create Workspace" from the dashboard
2. Enter organization and workspace names
3. Add an optional description
4. Start organizing your bookmarks!

### Inviting Team Members
1. Navigate to your workspace
2. Click "Invite Members"
3. Enter email addresses and assign roles
4. Team members receive email invitations
5. They can accept invitations to join the workspace

### Managing Permissions
- **Owner**: Full access to everything, can delete workspace
- **Admin**: Can manage members, settings, and all content
- **Member**: Can create, edit, and organize bookmarks
- **Viewer**: Read-only access to bookmarks and collections

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: OAuth (Google, GitHub), Magic Links
- **Email**: Nodemailer with React Email templates
- **Deployment**: Vercel-ready

## API Endpoints

### Workspaces
- `GET /api/workspaces` - Get user's workspaces
- `POST /api/workspaces` - Create new organization with workspace
- `GET /api/workspaces/[id]` - Get workspace details
- `POST /api/workspaces/[orgId]` - Create workspace in existing organization

### Invitations
- `POST /api/invitations` - Send invitation
- `GET /api/invitations?organizationId=xxx` - Get pending invitations
- `POST /api/invitations/accept` - Accept invitation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.