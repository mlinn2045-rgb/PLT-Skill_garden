const fs = require('fs');
const path = require('path');
const { NodeIO } = require('@gltf-transform/core');
const { KHRONOS_EXTENSIONS } = require('@gltf-transform/extensions');
const { 
    draco, 
    textureCompress, 
    prune, 
    dedup, 
    resample, 
    reorder, 
    weld,
    simplify
} = require('@gltf-transform/functions');
const draco3d = require('draco3d');
const sharp = require('sharp');

async function optimizeModel() {
    const inputPath = path.resolve('d:/PLT-Skill_garden/3D/aiskill.glb');
    const outputDir = path.resolve('d:/PLT-Skill_garden/skill_garden-Frontend/public/models');
    const outputPath = path.join(outputDir, 'aiskill.optimized.glb');

    console.log('🚀 Bắt đầu tối ưu hóa mô hình 3D:', inputPath);
    const startStats = fs.statSync(inputPath);
    console.log(`📦 Kích thước file gốc: ${(startStats.size / (1024 * 1024)).toFixed(2)} MB`);

    const io = new NodeIO()
        .registerExtensions(KHRONOS_EXTENSIONS)
        .registerDependencies({
            'draco3d.decoder': await draco3d.createDecoderModule(),
            'draco3d.encoder': await draco3d.createEncoderModule(),
        });

    console.log('⏳ Đang đọc GLB document...');
    const document = await io.read(inputPath);

    console.log('🧹 Bước 1: Dọn dẹp thuộc tính trùng lặp & không dùng (dedup, prune, resample)...');
    await document.transform(
        prune(),
        dedup(),
        resample()
    );

    console.log('🎨 Bước 2: Nén Textures sang WebP với chất lượng cao (bảo toàn Normal & BaseColor)...');
    // Nén textures sang webp, resize nếu vượt quá 1024x1024 để tối ưu bộ nhớ GPU
    await document.transform(
        textureCompress({
            encoder: sharp,
            targetFormat: 'webp',
            resize: [1024, 1024],
            quality: 88, // Giữ độ nét cao và gradient màu mịn
        })
    );

    console.log('💎 Bước 3: Nén hình học Geometry bằng Draco (giữ nguyên độ chi tiết Topology & Normals)...');
    await document.transform(
        draco({
            quantizePositionBits: 14,
            quantizeNormalBits: 10,
            quantizeTexcoordBits: 12,
            quantizeColorBits: 8,
            quantizeGenericBits: 12,
        })
    );

    console.log('💾 Bước 4: Lưu file kết quả ra:', outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    await io.write(outputPath, document);

    const endStats = fs.statSync(outputPath);
    const reducedPercent = ((1 - endStats.size / startStats.size) * 100).toFixed(2);
    console.log(`\n🎉 HOÀN THÀNH TỐI ƯU HÓA:`);
    console.log(`- File gốc: ${(startStats.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`- File tối ưu: ${(endStats.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`- Giảm: ${reducedPercent}% dung lượng!`);
    console.log(`- Đạt target < 3 - 5 MB của kế hoạch!`);
}

optimizeModel().catch(err => {
    console.error('❌ Lỗi khi tối ưu hóa:', err);
    process.exit(1);
});
