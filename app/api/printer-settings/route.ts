import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { PrinterSettingsModel } from "@/lib/models/PrinterSettings"

export async function GET() {
  await connectToDatabase()
  const doc = await PrinterSettingsModel.findOne().lean()

  if (!doc) {
    return NextResponse.json({
      printerSettings: {
        printerName: "Thermal Printer",
        connectionType: "usb",
        paperWidth: 58,
        autoPrint: false,
      },
    })
  }

  return NextResponse.json({
    printerSettings: {
      id: doc._id.toString(),
      printerName: doc.printerName,
      connectionType: doc.connectionType,
      address: doc.address,
      paperWidth: doc.paperWidth,
      autoPrint: doc.autoPrint,
    },
  })
}

export async function PUT(request: Request) {
  try {
    const json = await request.json()
    await connectToDatabase()

    const doc = await PrinterSettingsModel.findOneAndUpdate({}, json, {
      new: true,
      upsert: true,
    })

    return NextResponse.json({
      success: true,
      printerSettings: {
        id: doc._id.toString(),
        printerName: doc.printerName,
        connectionType: doc.connectionType,
        address: doc.address,
        paperWidth: doc.paperWidth,
        autoPrint: doc.autoPrint,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
