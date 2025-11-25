import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

export async function POST (request) {
    try {
        const data = await request.formData()
        const image = data.get('file')

        if(!image){
            return NextResponse.json(
                { success: false, error: 'No se ha subido la imagen' }, 
                { status: 400 }
            )
        }

        const bytes = await image.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const response = await new Promise ((resolve, reject) => {
            cloudinary.uploader.upload_stream({folder: 'Products'},(err,result) => {
                if (err) {
                    reject(err)
                }
                resolve(result)
            })
            .end(buffer)
        })

        return NextResponse.json({
            success: true,
            url: response.secure_url,
            // Mantener retrocompatibilidad
            preview: response.secure_url,
            name: response.display_name || response.public_id,
            isURL: true
        })
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error)
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Error al subir la imagen' 
            }, 
            { status: 500 }
        )
    }
}