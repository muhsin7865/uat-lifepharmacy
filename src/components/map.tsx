import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("./dynamicMap"), {
  ssr: false,
});


const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 600;

const Map = (props: any) => {
  const { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT } = props;
  return (
    <div style={{ aspectRatio: width / height }}>
      <DynamicMap {...props} />
    </div>
  );
};

export default Map;