"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok || !data?.user) {
        setError(data?.error || "Login failed")
        return
      }

      const role: string = data.user.role
      if (role === "admin") router.push("/admin")
      else if (role === "counter") router.push("/counter")
      else if (role === "waiter") router.push("/waiter")
      else if (role === "kitchen") router.push("/kitchen")
      else router.push("/")
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@restaurant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground text-center mb-3">Demo Accounts:</p>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded bg-muted">
              <div className="font-semibold text-primary">Admin</div>
              <div>Email: admin@restaurant.com</div>
              <div>Password: admin123</div>
              <div className="text-muted-foreground">Rajesh Kumar</div>
            </div>
            <div className="p-3 rounded bg-muted">
              <div className="font-semibold text-blue-600">Waiter</div>
              <div>Email: amit@restaurant.com</div>
              <div>Password: waiter123</div>
              <div className="text-muted-foreground">Amit Sharma</div>
            </div>
            <div className="p-3 rounded bg-muted">
              <div className="font-semibold text-green-600">Counter</div>
              <div>Email: suresh@restaurant.com</div>
              <div>Password: counter123</div>
              <div className="text-muted-foreground">Suresh Reddy</div>
            </div>
            <div className="p-3 rounded bg-muted">
              <div className="font-semibold text-orange-600">Kitchen</div>
              <div>Email: vijay@restaurant.com</div>
              <div>Password: kitchen123</div>
              <div className="text-muted-foreground">Chef Vijay</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
