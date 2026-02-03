import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  UserPlus,
  Users,
  Activity,
  BarChart3,
  Shield,
  Clock,
  TrendingUp,
  Edit,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: () => base44.entities.Activity.list("-created_date", 100),
  });

  const { data: candidates = [] } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => base44.entities.Candidate.list(),
  });

  const { data: interviews = [] } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => base44.entities.Interview.list(),
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      await base44.users.inviteUser(inviteEmail, inviteRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setInviteEmail("");
      setShowInviteDialog(false);
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async (permissions) => {
      await base44.entities.User.update(selectedUser.id, { permissions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowPermissionsDialog(false);
    },
  });

  const handleInvite = () => {
    if (inviteEmail) {
      inviteMutation.mutate();
    }
  };

  const handlePermissionsChange = (field, value) => {
    setSelectedUser({
      ...selectedUser,
      permissions: {
        ...selectedUser.permissions,
        [field]: value,
      },
    });
  };

  const handleSavePermissions = () => {
    updatePermissionsMutation.mutate(selectedUser.permissions);
  };

  // Analytics calculations
  const totalCandidates = candidates.length;
  const hiredCount = candidates.filter((c) => c.status === "hired").length;
  const interviewsThisMonth = interviews.filter((i) => {
    const date = new Date(i.created_date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const getUserActivityCount = (userEmail) => {
    return activities.filter((a) => a.user_email === userEmail).length;
  };

  const getRecentActivities = () => {
    return activities.slice(0, 20);
  };

  if (currentUser?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only administrators can access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Administration</h1>
            <p className="text-slate-600 mt-1">Manage users, permissions, and view system reports</p>
          </div>
          <Button onClick={() => setShowInviteDialog(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Invite User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Candidates</p>
                  <p className="text-2xl font-bold text-slate-900">{totalCandidates}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Interviews (Month)</p>
                  <p className="text-2xl font-bold text-slate-900">{interviewsThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Hired</p>
                  <p className="text-2xl font-bold text-slate-900">{hiredCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage consultant accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                          {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.full_name || user.email}</p>
                          <p className="text-sm text-slate-600">{user.email}</p>
                          {user.last_active && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              Last active: {format(new Date(user.last_active), "MMM d, HH:mm")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                        {user.permissions?.read_only && (
                          <Badge variant="outline" className="gap-1">
                            <Eye className="w-3 h-3" />
                            Read Only
                          </Badge>
                        )}
                        <div className="text-sm text-slate-600">
                          {getUserActivityCount(user.email)} actions
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowPermissionsDialog(true);
                          }}
                          className="gap-2"
                        >
                          <Shield className="w-4 h-4" />
                          Permissions
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Track all changes made by consultants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getRecentActivities().map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg"
                    >
                      <div className="p-2 bg-slate-100 rounded-lg">
                        {activity.action_type === "create" && <UserPlus className="w-4 h-4 text-green-600" />}
                        {activity.action_type === "update" && <Edit className="w-4 h-4 text-blue-600" />}
                        {activity.action_type === "view" && <Eye className="w-4 h-4 text-slate-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {activity.user_name || activity.user_email}
                        </p>
                        <p className="text-sm text-slate-600">
                          {activity.action_type} {activity.entity_type}: {activity.entity_name}
                        </p>
                        {activity.details && (
                          <p className="text-xs text-slate-500 mt-1">{activity.details}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          {format(new Date(activity.created_date), "MMM d, yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Consultant Performance</CardTitle>
                  <CardDescription>Activity by user</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.map((user) => {
                      const activityCount = getUserActivityCount(user.email);
                      return (
                        <div key={user.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {user.full_name || user.email}
                            </p>
                            <p className="text-xs text-slate-600">{user.role}</p>
                          </div>
                          <Badge variant="outline">{activityCount} actions</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pipeline Progress</CardTitle>
                  <CardDescription>Current recruitment status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { status: "sourced", label: "Sourced" },
                      { status: "cv_vetted", label: "CV Vetted" },
                      { status: "interviewed", label: "Interviewed" },
                      { status: "offer_made", label: "Offer Made" },
                      { status: "hired", label: "Hired" },
                    ].map((item) => {
                      const count = candidates.filter((c) => c.status === item.status).length;
                      return (
                        <div key={item.status} className="flex items-center justify-between">
                          <p className="text-sm text-slate-700">{item.label}</p>
                          <Badge>{count}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>Send an invitation to a new consultant</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="consultant@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex gap-4">
                <Button
                  variant={inviteRole === "user" ? "default" : "outline"}
                  onClick={() => setInviteRole("user")}
                  className="flex-1"
                >
                  Consultant
                </Button>
                <Button
                  variant={inviteRole === "admin" ? "default" : "outline"}
                  onClick={() => setInviteRole("admin")}
                  className="flex-1"
                >
                  Admin
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Permissions</DialogTitle>
            <DialogDescription>
              Manage access permissions for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="read_only">Read-Only Mode</Label>
              <Switch
                id="read_only"
                checked={selectedUser?.permissions?.read_only || false}
                onCheckedChange={(checked) => handlePermissionsChange("read_only", checked)}
              />
            </div>
            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-medium text-slate-700">Module Access</p>
              <div className="flex items-center justify-between">
                <Label htmlFor="candidates_read">Candidates - View</Label>
                <Switch
                  id="candidates_read"
                  checked={selectedUser?.permissions?.candidates_read ?? true}
                  onCheckedChange={(checked) => handlePermissionsChange("candidates_read", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="candidates_write">Candidates - Edit</Label>
                <Switch
                  id="candidates_write"
                  checked={selectedUser?.permissions?.candidates_write ?? true}
                  onCheckedChange={(checked) => handlePermissionsChange("candidates_write", checked)}
                  disabled={selectedUser?.permissions?.read_only}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="interviews_read">Interviews - View</Label>
                <Switch
                  id="interviews_read"
                  checked={selectedUser?.permissions?.interviews_read ?? true}
                  onCheckedChange={(checked) => handlePermissionsChange("interviews_read", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="interviews_write">Interviews - Edit</Label>
                <Switch
                  id="interviews_write"
                  checked={selectedUser?.permissions?.interviews_write ?? true}
                  onCheckedChange={(checked) => handlePermissionsChange("interviews_write", checked)}
                  disabled={selectedUser?.permissions?.read_only}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="learnerships_read">Learnerships - View</Label>
                <Switch
                  id="learnerships_read"
                  checked={selectedUser?.permissions?.learnerships_read ?? true}
                  onCheckedChange={(checked) => handlePermissionsChange("learnerships_read", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="learnerships_write">Learnerships - Edit</Label>
                <Switch
                  id="learnerships_write"
                  checked={selectedUser?.permissions?.learnerships_write ?? true}
                  onCheckedChange={(checked) => handlePermissionsChange("learnerships_write", checked)}
                  disabled={selectedUser?.permissions?.read_only}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}