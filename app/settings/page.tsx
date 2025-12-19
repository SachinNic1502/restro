"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

type PrinterSettings = {
  printerName: string
  connectionType: "usb" | "network" | "bluetooth"
  address?: string
  paperWidth?: number
  autoPrint?: boolean
}

export default function SettingsPage() {
  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>({
    printerName: "Thermal Printer",
    connectionType: "usb",
    paperWidth: 58,
    autoPrint: false,
  })
  const [loadingPrinter, setLoadingPrinter] = useState(false)
  const [savingPrinter, setSavingPrinter] = useState(false)

  const loadPrinterSettings = async () => {
    setLoadingPrinter(true)
    try {
      const res = await fetch("/api/printer-settings", { cache: "no-store" })
      const data = await res.json()
      if (data?.printerSettings) {
        setPrinterSettings((prev) => ({ ...prev, ...data.printerSettings }))
      }
    } finally {
      setLoadingPrinter(false)
    }
  }

  useEffect(() => {
    loadPrinterSettings()
  }, [])

  const savePrinterSettings = async () => {
    setSavingPrinter(true)
    try {
      const res = await fetch("/api/printer-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(printerSettings),
      })
      if (!res.ok) throw new Error()
      toast.success("Printer settings saved")
    } catch {
      toast.error("Failed to save printer settings")
    } finally {
      setSavingPrinter(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 flex-shrink-0">
        <AppSidebar role="admin" />
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your restaurant configuration</p>
          </div>
          <ThemeToggle />
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="printer">Printer</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Information</CardTitle>
                <CardDescription>Update your restaurant details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name</Label>
                  <Input id="name" defaultValue="The Grand Restaurant" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" defaultValue="123 Main Street, City, State 12345" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="info@restaurant.com" />
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
                <CardDescription>Set your restaurant opening hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <p className="text-sm font-medium">Monday - Friday</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="open">Opens</Label>
                    <Input id="open" type="time" defaultValue="09:00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="close">Closes</Label>
                    <Input id="close" type="time" defaultValue="22:00" />
                  </div>
                </div>
                <Button>Update Hours</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="printer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thermal Printer</CardTitle>
                <CardDescription>Configure how receipts are printed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="printerName">Printer Name</Label>
                  <Input
                    id="printerName"
                    value={printerSettings.printerName}
                    onChange={(e) => setPrinterSettings((p) => ({ ...p, printerName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Connection Type</Label>
                  <Select
                    value={printerSettings.connectionType}
                    onValueChange={(v) => setPrinterSettings((p) => ({ ...p, connectionType: v as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select connection" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usb">USB</SelectItem>
                      <SelectItem value="network">Network</SelectItem>
                      <SelectItem value="bluetooth">Bluetooth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(printerSettings.connectionType === "network" || printerSettings.connectionType === "bluetooth") && (
                  <div className="space-y-2">
                    <Label htmlFor="printerAddress">
                      {printerSettings.connectionType === "network" ? "IP Address" : "Bluetooth Address"}
                    </Label>
                    <Input
                      id="printerAddress"
                      value={printerSettings.address ?? ""}
                      onChange={(e) => setPrinterSettings((p) => ({ ...p, address: e.target.value }))}
                      placeholder={printerSettings.connectionType === "network" ? "192.168.1.10" : "AA:BB:CC:DD:EE"}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="paperWidth">Paper Width (mm)</Label>
                  <Input
                    id="paperWidth"
                    type="number"
                    value={printerSettings.paperWidth ?? 58}
                    onChange={(e) =>
                      setPrinterSettings((p) => ({ ...p, paperWidth: parseInt(e.target.value || "58", 10) }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div className="space-y-0.5">
                    <Label>Auto Print Receipts</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically print when a payment is completed.
                    </p>
                  </div>
                  <Switch
                    checked={printerSettings.autoPrint}
                    onCheckedChange={(checked) => setPrinterSettings((p) => ({ ...p, autoPrint: checked }))}
                  />
                </div>
                <Button onClick={savePrinterSettings} disabled={savingPrinter}>
                  {savingPrinter ? "Saving..." : "Save Printer Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Orders</Label>
                    <p className="text-sm text-muted-foreground">Get notified when new orders arrive</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Order Ready</Label>
                    <p className="text-sm text-muted-foreground">Alert when orders are ready for pickup</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify when inventory is running low</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive end-of-day sales reports</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>Manage your subscription and payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Professional Plan</p>
                      <p className="text-sm text-muted-foreground">$99/month</p>
                    </div>
                    <Button variant="outline">Change Plan</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs font-medium">
                        VISA
                      </div>
                      <div>
                        <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                        <p className="text-xs text-muted-foreground">Expires 12/25</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
