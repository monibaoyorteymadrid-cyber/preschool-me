"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function UsersListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users/list");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-600 text-2xl mb-4">❌</div>
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-sm text-gray-600">{error}</p>
              <Button onClick={fetchUsers} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Database Users</h1>
          <p className="text-gray-600">Check if admin users were created successfully</p>
        </div>

        {users.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-gray-400 text-4xl mb-4">👤</div>
                <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                <p className="text-sm text-gray-600 mb-4">
                  No users exist in the database. You need to complete the setup first.
                </p>
                <Button onClick={() => window.location.href = "/setup"}>
                  Go to Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>{users.length}</strong> total users found.
                <strong>{users.filter(u => u.role === "ADMIN").length}</strong> admin users.
              </p>
            </div>

            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {user.firstName} {user.lastName}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Created: {new Date(user.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">ID: {user.id}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <Button onClick={() => window.location.href = "/setup"}>
            Go to Setup
          </Button>
          <Button onClick={() => window.location.href = "/login"} variant="outline">
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  );
}