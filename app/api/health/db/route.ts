// app/api/health/db/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";

// GET /api/health/db - Database health check endpoint
export async function GET() {
  try {
    const startTime = Date.now();
    
    // Perform lightweight database operations to keep connection alive
    const [userCount, organizationCount, workspaceCount] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.workspace.count()
    ]);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        responseTime: `${responseTime}ms`,
        statistics: {
          users: userCount,
          organizations: organizationCount,
          workspaces: workspaceCount
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseProvider: "xata",
        region: "eu-west-1"
      }
    };
    
    console.log('✅ Database health check successful:', {
      responseTime: `${responseTime}ms`,
      userCount,
      organizationCount,
      workspaceCount
    });
    
    return NextResponse.json(healthData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    
    const errorData = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseProvider: "xata",
        region: "eu-west-1"
      }
    };
    
    return NextResponse.json(errorData, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}