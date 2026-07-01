
export interface MediaViewProps {
  isError: boolean;
  isLoading: boolean;
  images: {
    id: string;
    preview_url:string;
  }[];
}

const MediaView = ({
    isError = false,
    isLoading,
    images
}: MediaViewProps) => {

    if(isLoading){
        return(
            <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 bg-gray-100 px-4">
                Loading...
            </div>
        ); 
    }
    if(isError){
        return (
            <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 bg-gray-100 px-4">
                <p className="text-red-600">Error loading images.</p>
            </div>
        );
    }
    if(images.length === 0){
        return(
            <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 bg-gray-100 px-4">
                <p className="text-center text-gray-500 mt-10">No images found.</p>
            </div>
        );
    }


    return(
        <div className="h-full min-h-0 w-full p-4 bg-gray-100 overflow-y-auto">
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
                {images.map((img, idx) => (
                    <div key={idx} className="break-inside-avoid relative border rounded-lg overflow-hidden bg-slate-100 mb-4">
                        <img
                            src={img.preview_url}
                            alt="preview"
                            className="w-full h-auto object-contain"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MediaView