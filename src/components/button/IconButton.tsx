interface props {
    onClick? : React.MouseEventHandler<HTMLButtonElement> | undefined,
    src : string,
    alt : string,
    width?: number,
    height? : number,
}

const IconButton = ({onClick, src , alt, width , height} : props) =>{
    return(
        <button onClick={onClick}>
            <img src={src} alt={alt} style={{width : width ? `${width}px` : 'auto', height : height ? `${height}px` : 'auto',}} />
        </button>
    )
}

export default IconButton;