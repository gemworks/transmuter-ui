import avatar from 'gradient-avatar'


interface GradientAvatarProps {
    hash: string;
    width?: number;
    height?: number;
    cssClasses?: string
}
export default function GradientAvatar({hash, width, height, cssClasses}: GradientAvatarProps) {



		const svgAvatar = avatar(hash);
		

		return (
            <img className={`rounded-full w-${width ? width : 9} h-${height ? height : 9} object-scale-none ${cssClasses && cssClasses}`} src={`data:image/svg+xml;utf8,${encodeURIComponent(svgAvatar)}`} />
        )
    }
