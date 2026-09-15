/**
 * NOTES WALLAH - Admin Module Bridge
 * Part 3 of 10: Admin Integration Layer
 * 
 * Provides:
 * - Admin role verification
 * - Navigation to Admin Console (/admin/index.html)
 * - Administrative syllabus sync triggers
 */

class AdminService {
  constructor() {
    this.ADMIN_PATH = "admin/index.html";
  }

  /**
   * Checks whether currently logged in student has administrative privileges
   */
  async isCurrentUserAdmin() {
    const auth = window.NotesWallahAuth;
    const db = window.NotesWallahDatabase;
    const user = auth.getCurrentUser();
    if (!user || !user.uid) return false;

    if (user.role === "admin") return true;
    return await db.checkIsAdmin(user.uid);
  }

  /**
   * Launch Admin Console
   */
  openAdminConsole() {
    window.location.href = this.ADMIN_PATH;
  }
}

window.NotesWallahAdmin = new AdminService();
