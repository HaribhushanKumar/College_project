import express from 'express';
import { supabase, SUPABASE_PROJECT_ID, SUPABASE_URL, testSupabaseConnection } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/supabase/status
 * Check configuration & live connectivity to user's Supabase cloud instance
 */
router.get('/status', async (req, res) => {
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'dummy_key_for_init');
  const hasAnonKey = Boolean(process.env.SUPABASE_ANON_KEY);

  let connectionTest = { connected: false, message: 'Keys not configured yet' };

  if (hasServiceKey || hasAnonKey) {
    connectionTest = await testSupabaseConnection();
  }

  res.json({
    success: true,
    project: {
      projectId: SUPABASE_PROJECT_ID,
      region: 'ap-northeast-2 (Seoul)',
      projectName: 'college-fund-mgmt',
      endpoint: SUPABASE_URL,
      hasServiceRoleKey: hasServiceKey,
      hasAnonKey: hasAnonKey,
    },
    liveConnection: connectionTest,
    setupGuide: {
      keysDashboardUrl: `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/api`,
      sqlEditorUrl: `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`,
      migrationFile: 'server/database/supabase_schema.sql',
    },
  });
});

export default router;
