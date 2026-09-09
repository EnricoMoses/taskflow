<?php

namespace Database\Seeders;

use App\Enums\ProjectStatus;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Demo User
        $demoUser = User::factory()->create([
            'name' => 'Demo User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        // 2. Demo Projects
        $projects = [
            [
                'name' => 'TaskFlow Web Application',
                'description' => 'Modern project & task management web app built with Laravel 12, Inertia.js, React, and shadcn/ui.',
                'deadline' => Carbon::now()->addDays(14)->format('Y-m-d'),
                'status' => ProjectStatus::IN_PROGRESS,
                'tasks' => [
                    [
                        'title' => 'Design ERD & Database Schema',
                        'description' => 'Create migrations for users, projects, tasks, and task attachments with proper foreign keys and indices.',
                        'deadline' => Carbon::now()->subDays(2)->format('Y-m-d'),
                        'status' => TaskStatus::DONE,
                        'priority' => TaskPriority::HIGH,
                    ],
                    [
                        'title' => 'Implement Project CRUD & Policy',
                        'description' => 'Build backend controllers, FormRequests, and frontend React views with shadcn/ui Dialog and Table.',
                        'deadline' => Carbon::now()->addDays(2)->format('Y-m-d'),
                        'status' => TaskStatus::IN_PROGRESS,
                        'priority' => TaskPriority::HIGH,
                    ],
                    [
                        'title' => 'Kanban Board with Drag & Drop',
                        'description' => 'Integrate @dnd-kit to allow reordering and moving cards across Todo, In Progress, and Done columns.',
                        'deadline' => Carbon::now()->addDays(5)->format('Y-m-d'),
                        'status' => TaskStatus::TODO,
                        'priority' => TaskPriority::MEDIUM,
                    ],
                    [
                        'title' => 'File Upload & Attachment Support',
                        'description' => 'Allow up to 10MB file attachments per task with mime type validation.',
                        'deadline' => Carbon::now()->addDays(7)->format('Y-m-d'),
                        'status' => TaskStatus::TODO,
                        'priority' => TaskPriority::MEDIUM,
                    ],
                    [
                        'title' => 'PDF & Excel Export Reports',
                        'description' => 'Generate formatted task summary reports using DomPDF and Maatwebsite Excel.',
                        'deadline' => Carbon::now()->addDays(10)->format('Y-m-d'),
                        'status' => TaskStatus::TODO,
                        'priority' => TaskPriority::LOW,
                    ],
                ],
            ],
            [
                'name' => 'Mobile API Gateway',
                'description' => 'RESTful backend endpoints and authentication for iOS and Android client applications.',
                'deadline' => Carbon::now()->addDays(30)->format('Y-m-d'),
                'status' => ProjectStatus::PLANNING,
                'tasks' => [
                    [
                        'title' => 'Define OpenAPI Specification',
                        'description' => 'Write Swagger/OpenAPI docs for auth, profile, project, and task endpoints.',
                        'deadline' => Carbon::now()->addDays(4)->format('Y-m-d'),
                        'status' => TaskStatus::IN_PROGRESS,
                        'priority' => TaskPriority::HIGH,
                    ],
                    [
                        'title' => 'Sanctum Token Authentication',
                        'description' => 'Setup token issuance, refresh, and revocation mechanisms.',
                        'deadline' => Carbon::now()->addDays(8)->format('Y-m-d'),
                        'status' => TaskStatus::TODO,
                        'priority' => TaskPriority::MEDIUM,
                    ],
                    [
                        'title' => 'Push Notification Webhooks',
                        'description' => 'Integrate Firebase Cloud Messaging (FCM) webhooks for real-time task alerts.',
                        'deadline' => Carbon::now()->addDays(18)->format('Y-m-d'),
                        'status' => TaskStatus::TODO,
                        'priority' => TaskPriority::LOW,
                    ],
                ],
            ],
            [
                'name' => 'Company Landing Page',
                'description' => 'High-conversion marketing landing page with interactive product preview and testimonials.',
                'deadline' => Carbon::now()->subDays(5)->format('Y-m-d'),
                'status' => ProjectStatus::COMPLETED,
                'tasks' => [
                    [
                        'title' => 'Hero Section & Call-To-Action',
                        'description' => 'Craft compelling copy and interactive UI demo component.',
                        'deadline' => Carbon::now()->subDays(10)->format('Y-m-d'),
                        'status' => TaskStatus::DONE,
                        'priority' => TaskPriority::HIGH,
                    ],
                    [
                        'title' => 'SEO & Meta Tags Optimization',
                        'description' => 'Setup OpenGraph, Twitter Cards, Sitemap, and structured schema JSON-LD.',
                        'deadline' => Carbon::now()->subDays(7)->format('Y-m-d'),
                        'status' => TaskStatus::DONE,
                        'priority' => TaskPriority::MEDIUM,
                    ],
                ],
            ],
            [
                'name' => 'Cloud Infrastructure Migration',
                'description' => 'Migration from legacy VPS hosting to Render managed services with PostgreSQL and Cloudflare CDN.',
                'deadline' => Carbon::now()->addDays(45)->format('Y-m-d'),
                'status' => ProjectStatus::ON_HOLD,
                'tasks' => [
                    [
                        'title' => 'Database Backup & Replication Strategy',
                        'description' => 'Setup automated daily snapshots and disaster recovery procedures.',
                        'deadline' => Carbon::now()->addDays(12)->format('Y-m-d'),
                        'status' => TaskStatus::TODO,
                        'priority' => TaskPriority::HIGH,
                    ],
                ],
            ],
        ];

        foreach ($projects as $projData) {
            $tasks = $projData['tasks'];
            unset($projData['tasks']);

            $project = $demoUser->projects()->create($projData);

            $orderGroup = [
                TaskStatus::TODO->value => 0,
                TaskStatus::IN_PROGRESS->value => 0,
                TaskStatus::DONE->value => 0,
            ];

            foreach ($tasks as $taskData) {
                $statusVal = $taskData['status']->value;
                $taskData['order'] = $orderGroup[$statusVal]++;
                $project->tasks()->create($taskData);
            }
        }

        // 3. Second user for authorization testing
        $otherUser = User::factory()->create([
            'name' => 'Other User',
            'email' => 'other@example.com',
            'password' => bcrypt('password'),
        ]);

        $otherProject = $otherUser->projects()->create([
            'name' => 'Confidential Internal Audit',
            'description' => 'Private project that should not be visible to the demo user.',
            'deadline' => Carbon::now()->addDays(20)->format('Y-m-d'),
            'status' => ProjectStatus::PLANNING,
        ]);

        $otherProject->tasks()->create([
            'title' => 'Audit User Permissions & Roles',
            'description' => 'Verify strictly scoped queries and policy guards.',
            'deadline' => Carbon::now()->addDays(5)->format('Y-m-d'),
            'status' => TaskStatus::TODO,
            'priority' => TaskPriority::HIGH,
            'order' => 0,
        ]);
    }
}
