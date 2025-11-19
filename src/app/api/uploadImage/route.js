import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

export async function POST (request) {
    const data = await request.formData()
    const image = data.get('file')
    //console.log(image,'data aca')

    if(!image){
        return NextResponse.json('no se ha subido la imagen', { status: 400 })
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
    // console.log({
    //     preview:response.secure_url.toString(),
    //     name:response.display_name.toString(),
    //     isURL:true
    // },'response cloudinary')
    return NextResponse.json({
        preview:response.secure_url.toString(),
        name:response.display_name.toString(),
        isURL:true
    })
    }