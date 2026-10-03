#import <AppKit/AppKit.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSString *inputPath = @"/Users/thamindubandara/.gemini/antigravity/brain/db1712ca-b6a3-40b3-9108-e377a2103443/bodimkarayo_logo_transparent_1790317139950.jpg";
        NSString *outputPath = @"frontend/src/assets/logo.png";
        
        NSImage *image = [[NSImage alloc] initWithContentsOfFile:inputPath];
        if (!image) {
            NSLog(@"Failed to load image");
            return 1;
        }
        
        CGImageRef cgImage = [image CGImageForProposedRect:NULL context:NULL hints:NULL];
        size_t width = CGImageGetWidth(cgImage);
        size_t height = CGImageGetHeight(cgImage);
        
        size_t bytesPerPixel = 4;
        size_t bytesPerRow = bytesPerPixel * width;
        unsigned char *rawData = (unsigned char *)calloc(height * bytesPerRow, sizeof(unsigned char));
        
        CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
        CGContextRef context = CGBitmapContextCreate(rawData, width, height, 8, bytesPerRow, colorSpace, kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
        CGColorSpaceRelease(colorSpace);
        
        CGContextDrawImage(context, CGRectMake(0, 0, width, height), cgImage);
        
        for (size_t y = 0; y < height; y++) {
            for (size_t x = 0; x < width; x++) {
                size_t byteIndex = (bytesPerRow * y) + (x * bytesPerPixel);
                unsigned char r = rawData[byteIndex];
                unsigned char g = rawData[byteIndex + 1];
                unsigned char b = rawData[byteIndex + 2];
                
                if (r > 215 && g > 215 && b > 215) {
                    rawData[byteIndex] = 0;
                    rawData[byteIndex + 1] = 0;
                    rawData[byteIndex + 2] = 0;
                    rawData[byteIndex + 3] = 0;
                }
            }
        }
        
        CGImageRef newCgImage = CGBitmapContextCreateImage(context);
        NSBitmapImageRep *newRep = [[NSBitmapImageRep alloc] initWithCGImage:newCgImage];
        NSData *pngData = [newRep representationUsingType:NSBitmapImageFileTypePNG properties:@{}];
        
        [pngData writeToFile:outputPath atomically:YES];
        [pngData writeToFile:@"frontend/public/logo.png" atomically:YES];
        [pngData writeToFile:@"frontend/public/vite.svg" atomically:YES];
        [pngData writeToFile:@"frontend/public/favicon.ico" atomically:YES];
        
        NSLog(@"SUCCESS: True transparent PNG created!");
        
        CGContextRelease(context);
        CGImageRelease(newCgImage);
        free(rawData);
    }
    return 0;
}
