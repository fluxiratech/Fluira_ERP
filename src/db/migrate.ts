import { pool } from './index';
import { initializeDatabase } from './dbOperations';

async function runMigration() {
  console.log('===========================================================');
  console.log('[PostgreSQL Migration] Running Database Migration Script...');
  console.log('===========================================================');
  const startTime = Date.now();

  try {
    // 1. Create missing tables explicitly
    console.log('[PostgreSQL Migration] Verifying & Creating missing relations:');
    console.log(' - chat_conversations');
    console.log(' - chat_messages');
    console.log(' - import_logs');
    console.log(' - promotion_history');
    console.log(' - class_teacher_assignments');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id TEXT PRIMARY KEY,
        participant_id TEXT NOT NULL,
        participant_name TEXT NOT NULL,
        participant_role TEXT NOT NULL,
        participant_avatar TEXT,
        participant_status TEXT DEFAULT 'Offline',
        last_message TEXT,
        last_message_time TEXT,
        unread_count INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
        sender_id TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        sender_role TEXT NOT NULL,
        sender_avatar TEXT,
        text TEXT NOT NULL,
        attachment_url TEXT,
        attachment_type TEXT,
        created_at TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS import_logs (
        id TEXT PRIMARY KEY,
        file_name TEXT NOT NULL,
        uploaded_at TEXT NOT NULL,
        uploaded_by TEXT NOT NULL,
        total_records INTEGER DEFAULT 0,
        imported_count INTEGER DEFAULT 0,
        updated_count INTEGER DEFAULT 0,
        skipped_count INTEGER DEFAULT 0,
        status TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS promotion_history (
        id TEXT PRIMARY KEY,
        batch_name TEXT NOT NULL,
        promotedAt TEXT, -- fallback
        promoted_at TEXT NOT NULL,
        promoted_by TEXT NOT NULL,
        program TEXT NOT NULL,
        course TEXT NOT NULL,
        from_semester INTEGER NOT NULL,
        to_semester INTEGER NOT NULL,
        total_students_promoted INTEGER DEFAULT 0,
        status TEXT NOT NULL,
        records TEXT
      );

      CREATE TABLE IF NOT EXISTS class_teacher_assignments (
        id TEXT PRIMARY KEY,
        department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
        department_name TEXT NOT NULL,
        course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        course_code TEXT NOT NULL,
        course_name TEXT NOT NULL,
        academic_year TEXT NOT NULL,
        semester INTEGER NOT NULL,
        division TEXT NOT NULL,
        class_teacher_id TEXT NOT NULL REFERENCES faculty_list(id) ON DELETE CASCADE,
        class_teacher_name TEXT NOT NULL,
        assistant_teacher_id TEXT REFERENCES faculty_list(id) ON DELETE SET NULL,
        assistant_teacher_name TEXT,
        classroom TEXT NOT NULL,
        academic_session TEXT NOT NULL,
        assigned_at TEXT NOT NULL,
        assigned_by TEXT NOT NULL
      );
    `);

    // 2. Run full initializeDatabase helper to ensure initial seed data is present if tables were empty
    await initializeDatabase();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('===========================================================');
    console.log(`[PostgreSQL Migration] Migration completed successfully in ${duration}s!`);
    console.log('===========================================================');
  } catch (error) {
    console.error('[PostgreSQL Migration] Error executing migration script:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runMigration();
