"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Shield,
  UserCheck,
  Search,
  RotateCcw,
  Loader2,
  ArrowUpDown,
  FileText,
  Plus,
  Edit,
  Trash2,
  Check,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";

interface ManagedUser {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "user";
  createdAt: string;
  _count: {
    submissions: number;
  };
}

export function UsersManager() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"admin" | "user">("user");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (roleFilter !== "all") params.append("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("user");
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (targetUser: ManagedUser) => {
    setEditingUser(targetUser);
    setFormName(targetUser.name || "");
    setFormEmail(targetUser.email);
    setFormPassword(""); // blank means don't change password
    setFormRole(targetUser.role);
    setModalOpen(true);
  };

  // Save Create or Edit
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail) {
      toast.error("Email is required");
      return;
    }
    if (!editingUser && !formPassword) {
      toast.error("Password is required when creating a new user");
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingUser) {
        // UPDATE User
        const payload: any = {
          name: formName,
          email: formEmail,
          role: formRole,
        };
        if (formPassword) payload.password = formPassword;

        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to update user");

        toast.success(`Updated user "${formEmail}"`);
      } else {
        // CREATE User
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName || formEmail.split("@")[0],
            email: formEmail,
            password: formPassword,
            role: formRole,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to create user");

        toast.success(`Created user "${formEmail}" with role ${formRole === "admin" ? "Admin" : "Tool Submitter"}!`);
      }

      setModalOpen(false);
      loadUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving user";
      toast.error(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Quick Role Toggle (Promote/Demote)
  const handleToggleRole = async (targetUser: ManagedUser) => {
    if (currentAdmin?.id === targetUser.id && targetUser.role === "admin") {
      toast.error("You cannot demote your own admin account.");
      return;
    }

    const newRole = targetUser.role === "admin" ? "user" : "admin";
    const actionLabel = newRole === "admin" ? "promote to Admin" : "change to Tool Submitter";

    if (!confirm(`Are you sure you want to ${actionLabel} for "${targetUser.email}"?`)) {
      return;
    }

    setActionLoadingId(targetUser.id);
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update role");

      toast.success(
        newRole === "admin"
          ? `Promoted ${targetUser.email} to Admin!`
          : `Changed ${targetUser.email} to Tool Submitter.`
      );
      loadUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error changing role";
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete User
  const handleDeleteUser = async (targetUser: ManagedUser) => {
    if (currentAdmin?.id === targetUser.id) {
      toast.error("You cannot delete your own admin account while logged in.");
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete user account "${targetUser.email}"?`)) {
      return;
    }

    setActionLoadingId(targetUser.id);
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete user");

      toast.success(`Deleted user account "${targetUser.email}".`);
      loadUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting user";
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email ? email[0].toUpperCase() : "U";
  };

  const counts = {
    all: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    submitters: users.filter((u) => u.role === "user").length,
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Filters, Search & Add User */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Role Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant={roleFilter === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setRoleFilter("all")}
            className="text-xs h-8"
          >
            All Users ({counts.all})
          </Button>
          <Button
            variant={roleFilter === "admin" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setRoleFilter("admin")}
            className="text-xs h-8 gap-1.5 text-violet-600 dark:text-violet-400"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Admins ({counts.admins})</span>
          </Button>
          <Button
            variant={roleFilter === "user" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setRoleFilter("user")}
            className="text-xs h-8 gap-1.5 text-sky-600 dark:text-sky-400"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Tool Submitters ({counts.submitters})</span>
          </Button>
        </div>

        {/* Search & Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={loadUsers}
            title="Refresh user list"
            className="h-8 w-8 shrink-0"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            size="sm"
            onClick={openCreateModal}
            className="h-8 text-xs gap-1.5 shrink-0 bg-primary text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create User</span>
          </Button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <div className="py-12 text-center rounded-xl border border-dashed border-border bg-card/40">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold">No users found</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different search term or filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">User & Contact</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3">Submissions</th>
                <th className="px-4 py-3">Joined Date</th>
                <th className="px-4 py-3 text-right">Actions (Edit / Role / Delete)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.map((u) => {
                const isCurrentSelf = currentAdmin?.id === u.id;
                const isAdmin = u.role === "admin";
                const isUpdating = actionLoadingId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {getInitials(u.name, u.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                            <span>{u.name || "Unnamed User"}</span>
                            {isCurrentSelf && (
                              <span className="text-[10px] text-muted-foreground font-normal">(You)</span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <Badge className="bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30 gap-1 font-semibold">
                          <Shield className="h-3 w-3" />
                          <span>Admin</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-sky-500/30 text-sky-600 dark:text-sky-400 gap-1 font-semibold">
                          <UserCheck className="h-3 w-3" />
                          <span>Tool Submitter</span>
                        </Badge>
                      )}
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {isAdmin
                          ? "Full access to Admin Console, Tools, & Submissions"
                          : "Can log in and submit tools for review"}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-medium">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{u._count.submissions} submitted</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Toggle Role Button */}
                        {!isCurrentSelf && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() => handleToggleRole(u)}
                            className="h-7 text-xs gap-1"
                            title={isAdmin ? "Demote to Submitter" : "Promote to Admin"}
                          >
                            <ArrowUpDown className="h-3 w-3" />
                            <span>{isAdmin ? "Demote" : "Promote"}</span>
                          </Button>
                        )}

                        {/* Edit User Button */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditModal(u)}
                          title="Edit user details and role"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>

                        {/* Delete User Button */}
                        {!isCurrentSelf ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={isUpdating}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteUser(u)}
                            title="Delete user account"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic px-1">Current User</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT USER DIALOG */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>{editingUser ? `Edit User: ${editingUser.email}` : "Create New User / Admin"}</span>
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update user profile, contact details, or assigned role."
                : "Create a new user account with immediate Admin or Tool Submitter permissions."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveUser} className="space-y-3.5 py-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Full Name or Handle</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Email Address <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="elena@example.com"
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                {editingUser ? "Reset Password (leave blank to keep unchanged)" : "Password (min 6 chars)"}{" "}
                {!editingUser && <span className="text-destructive">*</span>}
              </label>
              <Input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="••••••••"
                required={!editingUser}
                minLength={editingUser ? undefined : 6}
                className="text-xs"
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-foreground">Account Role & Privileges</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormRole("user")}
                  className={`p-3 rounded-lg border text-left transition-colors flex flex-col gap-1 ${
                    formRole === "user"
                      ? "border-sky-500 bg-sky-500/10 text-foreground"
                      : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs">
                    <UserCheck className="h-3.5 w-3.5 text-sky-500" />
                    <span>Tool Submitter</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Can submit tools and track submission review status.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormRole("admin")}
                  className={`p-3 rounded-lg border text-left transition-colors flex flex-col gap-1 ${
                    formRole === "admin"
                      ? "border-violet-500 bg-violet-500/10 text-foreground"
                      : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-violet-600 dark:text-violet-400">
                    <Shield className="h-3.5 w-3.5 text-violet-500" />
                    <span>Administrator</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Full CRUD on tools, submissions, and user accounts.
                  </p>
                </button>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModalOpen(false)}
                disabled={formSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formSubmitting} className="gap-2">
                {formSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>{editingUser ? "Save Changes" : "Create Account"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
