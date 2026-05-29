import { ImgHTMLAttributes } from 'react';

export default function ApplicationLogo(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/logo_energy.webp"
            alt="Energy 4.0"
            className="h-10 w-auto"
            {...props}
        />
    );
}
