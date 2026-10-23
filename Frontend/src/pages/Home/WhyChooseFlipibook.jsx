import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import exploreArrowIcon from '../../assets/Home/explore-arrow-icon.png';

export default function WhyChooseFlipibook() {
  return (
    <section className="w-full bg-[#FAFAFA] text-[#1C1D21] pt-12 lg:pt-[4.5vw] pb-16 lg:pb-[5.5vw] px-6 sm:px-10 lg:px-[5vw] font-poppins relative overflow-hidden select-none">
      
      {/* Top Header Tag Row with Sub-Labels */}
      <div className="w-full max-w-[1920px] mx-auto flex items-center justify-between mb-4 lg:mb-[1.2vw]">
        <div className="flex items-center gap-3">
          <span className="text-sm sm:text-[15px] lg:text-[0.85vw] font-semibold tracking-[0.28em] text-[#35363A] uppercase">
            WHY FLIPIBOOK
          </span>
          <div className="w-12 lg:w-[3vw] h-[1.5px] bg-[#35363A]/40"></div>
        </div>

        <div className="hidden sm:flex items-start text-left gap-3">
          <div className="w-[2px] h-[36px] lg:h-[2.4vw] bg-[#EC5137] rounded-full mt-0.5"></div>
          <div className="flex flex-col">
            <span className="text-[13px] sm:text-[14px] lg:text-[0.78vw] font-semibold text-[#35363A] uppercase tracking-wider leading-snug">
              FEATURED FLIPBOOK
            </span>
            <span className="text-[11.5px] sm:text-[12px] lg:text-[0.68vw] font-medium text-[#35363A] uppercase tracking-wider leading-snug">
              LEADING THE INDUSTRY REVOLUTION
            </span>
          </div>
        </div>
      </div>

      {/* Main Title Row: Why Choose Flipibook ? */}
      <div className="w-full max-w-[1920px] mx-auto mb-2 lg:mb-[0.5vw]">
        <h2 className="text-[40px] sm:text-[48px] lg:text-[3.1vw] font-semibold tracking-tight text-[#35363A] leading-[1.12] lg:max-w-[26vw]">
          Why Choose <br />
          <span className="text-[#EC5137]">Flipibook ?</span>
        </h2>
        <p className="text-[14px] sm:text-[15.5px] lg:text-[0.88vw] text-[#69707D] lg:max-w-[28vw] mt-4 lg:mt-[1vw] leading-[1.65] font-normal">
          From product catalogues to marketing brochures, create stunning digital experiences that drive engagement and business growth.
        </p>
      </div>

      {/* 
        Exact Figma Canvas Container:
        Figma artboard coordinate reference: X: 0 to 1920, Y: 340 to 920 (~580px relative height)
        Aspect ratio lock ensures SVG and cards NEVER detach or stretch out of alignment on any screen width!
      */}
      <div className="w-full max-w-[1920px] mx-auto relative hidden md:block mt-0 lg:-mt-[2.5vw]" style={{ aspectRatio: '1920 / 580' }}>
        
        {/* Background SVG Wave and Accent Dots directly from Figma:
            Bounding box transformed to (0, 340) coordinate space:
            viewBox="32 340 1920 580"
        */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox="32 340 1920 580"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Exact Figma Path for the dotted trajectory */}
          <path
            d="M784 603L784.242 603.437V603.437L784 603ZM1341.89 509.768L1341.67 509.32L1341.66 509.326L1341.89 509.768ZM1679.83 484.808L1679.61 485.259V485.259L1679.83 484.808ZM1785.5 411.055C1785.53 410.78 1785.33 410.533 1785.05 410.503C1784.78 410.473 1784.53 410.671 1784.5 410.945L1785 411L1785.5 411.055ZM532 646L532.072 645.505V645.505L532 646ZM291 603L291.145 603.478V603.478L291 603ZM148 707C148.369 707.338 148.369 707.338 148.369 707.338C148.369 707.338 148.369 707.338 148.369 707.338C148.369 707.338 148.369 707.338 148.369 707.338C148.369 707.338 148.369 707.338 148.369 707.338C148.369 707.337 148.369 707.337 148.37 707.336C148.371 707.336 148.372 707.334 148.374 707.332C148.377 707.329 148.382 707.323 148.389 707.315C148.403 707.3 148.424 707.278 148.452 707.248C148.507 707.187 148.59 707.098 148.7 706.979C148.92 706.742 149.248 706.39 149.679 705.931C150.541 705.014 151.814 703.671 153.46 701.969L153.1 701.621L152.741 701.274C151.092 702.98 149.815 704.326 148.95 705.246C148.518 705.707 148.188 706.06 147.967 706.299C147.856 706.418 147.773 706.509 147.716 706.57C147.688 706.6 147.667 706.623 147.653 706.639C147.646 706.646 147.641 706.652 147.637 706.656C147.635 706.658 147.634 706.66 147.633 706.661C147.632 706.661 147.632 706.661 147.632 706.662C147.632 706.662 147.632 706.662 147.631 706.662C147.631 706.662 147.631 706.662 147.631 706.662C147.631 706.662 147.631 706.662 148 707ZM163.575 691.081L163.925 691.438C167.101 688.321 170.698 684.86 174.653 681.158L174.311 680.793L173.969 680.428C170.008 684.136 166.406 687.602 163.225 690.724L163.575 691.081ZM185.307 670.743L185.64 671.117C189.197 667.943 192.942 664.678 196.844 661.371L196.521 660.99L196.198 660.608C192.288 663.921 188.537 667.192 184.974 670.37L185.307 670.743ZM208.003 651.53L208.315 651.921C212.131 648.867 216.055 645.82 220.063 642.818L219.763 642.417L219.463 642.017C215.446 645.027 211.514 648.08 207.69 651.14L208.003 651.53ZM231.829 633.714L232.114 634.125C236.191 631.3 240.328 628.555 244.502 625.928L244.236 625.505L243.969 625.081C239.782 627.717 235.633 630.47 231.544 633.303L231.829 633.714ZM257.027 617.911L257.27 618.348C261.661 615.904 266.067 613.628 270.465 611.56L270.252 611.107L270.039 610.655C265.619 612.734 261.192 615.021 256.784 617.474L257.027 617.911ZM283.958 605.359L284.13 605.829C286.48 604.97 288.82 604.184 291.145 603.478L291 603L290.855 602.522C288.51 603.233 286.153 604.025 283.786 604.889L283.958 605.359ZM291 603L291.145 603.478C293.67 602.712 296.166 602.011 298.636 601.371L298.511 600.887L298.385 600.403C295.902 601.046 293.392 601.751 290.855 602.522L291 603ZM313.746 597.651L313.827 598.144C319.071 597.277 324.201 596.686 329.236 596.342L329.202 595.844L329.168 595.345C324.101 595.69 318.939 596.285 313.664 597.157L313.746 597.651ZM344.757 595.542L344.743 596.042C349.98 596.194 355.129 596.598 360.212 597.218L360.272 596.721L360.333 596.225C355.221 595.602 350.042 595.196 344.772 595.042L344.757 595.542ZM375.631 599.245L375.53 599.734C380.603 600.774 385.629 601.998 390.634 603.369L390.766 602.887L390.898 602.404C385.875 601.029 380.827 599.799 375.731 598.755L375.631 599.245ZM405.672 607.375L405.517 607.851C410.412 609.444 415.308 611.14 420.227 612.903L420.396 612.433L420.564 611.962C415.639 610.197 410.733 608.497 405.826 606.9L405.672 607.375ZM435.013 617.796L434.838 618.264C439.653 620.057 444.513 621.879 449.432 623.694L449.605 623.225L449.778 622.756C444.861 620.942 440.005 619.121 435.187 617.327L435.013 617.796ZM464.252 628.507L464.087 628.979C468.931 630.674 473.851 632.334 478.862 633.929L479.014 633.452L479.166 632.976C474.165 631.385 469.255 629.728 464.417 628.035L464.252 628.507ZM493.934 637.898L493.801 638.38C498.737 639.744 503.772 641.024 508.919 642.194L509.03 641.706L509.141 641.219C504.01 640.052 498.99 638.776 494.067 637.416L493.934 637.898ZM524.302 644.771L524.217 645.264C526.758 645.705 529.328 646.116 531.928 646.495L532 646L532.072 645.505C529.481 645.128 526.92 644.718 524.388 644.279L524.302 644.771ZM532 646L531.928 646.495C534.634 646.889 537.326 647.257 540.006 647.601L540.069 647.105L540.133 646.609C537.459 646.266 534.772 645.898 532.072 645.505L532 646ZM556.248 648.891L556.202 649.389C561.672 649.896 567.085 650.297 572.442 650.596L572.47 650.097L572.498 649.598C567.153 649.299 561.752 648.899 556.294 648.394L556.248 648.891ZM588.721 650.702L588.711 651.202C594.203 651.302 599.633 651.296 605 651.187L604.99 650.687L604.98 650.187C599.625 650.296 594.209 650.302 588.73 650.202L588.721 650.702ZM621.251 650.033L621.281 650.532C626.762 650.203 632.175 649.765 637.52 649.225L637.47 648.727L637.42 648.23C632.088 648.769 626.689 649.205 621.221 649.534L621.251 650.033ZM653.62 646.757L653.691 647.252C659.123 646.475 664.481 645.591 669.765 644.606L669.673 644.114L669.581 643.623C664.312 644.605 658.967 645.487 653.549 646.262L653.62 646.757ZM685.599 640.794L685.712 641.282C691.055 640.048 696.319 638.712 701.501 637.278L701.368 636.797L701.235 636.315C696.066 637.744 690.817 639.077 685.487 640.307L685.599 640.794ZM716.949 632.124L717.103 632.6C722.319 630.912 727.449 629.127 732.491 627.251L732.317 626.782L732.142 626.314C727.113 628.184 721.998 629.965 716.795 631.648L716.949 632.124ZM747.443 620.781L747.638 621.241C752.689 619.11 757.646 616.89 762.509 614.588L762.295 614.136L762.081 613.684C757.231 615.98 752.287 618.195 747.249 620.32L747.443 620.781ZM776.846 606.864L777.079 607.307C779.492 606.036 781.879 604.746 784.242 603.437L784 603L783.758 602.563C781.401 603.868 779.019 605.155 776.613 606.422L776.846 606.864ZM784 603L784.242 603.437C786.547 602.161 788.838 600.864 791.118 599.55L790.868 599.117L790.618 598.684C788.343 599.995 786.057 601.289 783.758 602.563L784 603ZM804.422 591.038L804.684 591.464C809.178 588.705 813.632 585.898 818.055 583.067L817.786 582.646L817.516 582.225C813.097 585.053 808.648 587.857 804.161 590.612L804.422 591.038ZM831.027 574.062L831.301 574.481C835.719 571.591 840.116 568.697 844.495 565.828L844.221 565.409L844.221 565.409C839.565 567.863 835.172 570.753 830.753 573.644L831.027 574.062ZM857.45 556.811L857.72 557.231C862.172 554.371 866.617 551.559 871.064 548.821L870.801 548.395L870.539 547.969C866.085 550.711 861.635 553.527 857.179 556.39L857.45 556.811ZM884.355 540.314L884.604 540.748C889.195 538.111 893.798 535.58 898.422 533.182L898.192 532.738L897.962 532.294C893.323 534.699 888.708 537.238 884.106 539.881L884.355 540.314ZM912.391 525.857L912.596 526.313C917.417 524.151 922.272 522.159 927.171 520.369L926.999 519.9L926.827 519.43C921.904 521.229 917.027 523.229 912.186 525.401L912.391 525.857ZM942.026 515.112L942.157 515.594C947.216 514.226 952.331 513.095 957.514 512.232L957.432 511.739L957.35 511.246C952.132 512.114 946.985 513.252 941.896 514.629L942.026 515.112ZM973.106 509.99L973.134 510.489C975.736 510.343 978.356 510.268 980.997 510.268V509.768V509.268C978.337 509.268 975.698 509.343 973.078 509.491L973.106 509.99ZM980.997 509.768V510.268C983.614 510.268 986.203 510.286 988.765 510.323L988.772 509.823L988.779 509.323C986.212 509.286 983.618 509.268 980.997 509.268V509.768ZM1004.16 510.265L1004.13 510.765C1009.36 510.991 1014.47 511.29 1019.48 511.653L1019.52 511.155L1019.55 510.656C1014.54 510.292 1009.41 509.992 1004.18 509.766L1004.16 510.265ZM1034.84 512.491L1034.79 512.988C1039.98 513.517 1045.06 514.111 1050.04 514.759L1050.1 514.264L1050.17 513.768C1045.18 513.119 1040.09 512.523 1034.89 511.993L1034.84 512.491ZM1065.35 516.459L1065.27 516.953C1070.45 517.766 1075.5 518.629 1080.46 519.529L1080.55 519.037L1080.64 518.545C1075.67 517.644 1070.61 516.78 1065.43 515.965L1065.35 516.459ZM1095.66 521.935L1095.56 522.426C1100.67 523.456 1105.68 524.511 1110.61 525.573L1110.71 525.084L1110.82 524.595C1105.89 523.533 1100.87 522.477 1095.75 521.445L1095.66 521.935ZM1125.76 528.39L1125.65 528.878C1130.73 530.006 1135.73 531.122 1140.66 532.203L1140.77 531.715L1140.88 531.226C1135.94 530.145 1130.95 529.03 1125.87 527.902L1125.76 528.39ZM1155.84 534.926L1155.74 535.416C1160.82 536.456 1165.85 537.434 1170.86 538.325L1170.95 537.833L1171.03 537.341C1166.04 536.452 1161.02 535.475 1155.94 534.436L1155.84 534.926ZM1186.15 540.254L1186.09 540.75C1191.19 541.455 1196.28 542.042 1201.4 542.484L1201.44 541.986L1201.49 541.488C1196.39 541.047 1191.31 540.462 1186.22 539.759L1186.15 540.254ZM1216.81 542.846L1216.8 543.346C1221.89 543.469 1227.02 543.426 1232.21 543.19L1232.19 542.691L1232.17 542.191C1227 542.426 1221.89 542.469 1216.82 542.346L1216.81 542.846ZM1247.54 541.436L1247.6 541.933C1252.59 541.34 1257.66 540.557 1262.82 539.564L1262.73 539.073L1262.63 538.582C1257.49 539.571 1252.45 540.35 1247.48 540.94L1247.54 541.436ZM1277.72 535.647L1277.85 536.13C1282.7 534.85 1287.64 533.38 1292.68 531.706L1292.52 531.231L1292.36 530.757C1287.34 532.425 1282.42 533.888 1277.6 535.163L1277.72 535.647ZM1306.94 525.987L1307.12 526.452C1311.75 524.624 1316.47 522.626 1321.29 520.447L1321.09 519.991L1320.88 519.535C1316.08 521.708 1311.37 523.7 1306.76 525.522L1306.94 525.987ZM1334.96 513.349L1335.19 513.796C1337.48 512.641 1339.79 511.446 1342.12 510.21L1341.89 509.768L1341.66 509.326C1339.33 510.559 1337.02 511.751 1334.74 512.903L1334.96 513.349ZM1341.89 509.768L1342.11 510.215C1344.62 508.964 1347.1 507.729 1349.54 506.51L1349.32 506.062L1349.09 505.615C1346.65 506.834 1344.17 508.069 1341.67 509.32L1341.89 509.768ZM1363.98 498.772L1364.2 499.22C1369.22 496.728 1374.11 494.313 1378.88 491.976L1378.66 491.527L1378.44 491.078C1373.67 493.416 1368.78 495.832 1363.75 498.324L1363.98 498.772ZM1393.37 484.363L1393.59 484.813C1398.65 482.372 1403.56 480.028 1408.34 477.783L1408.13 477.331L1407.91 476.878C1403.13 479.125 1398.22 481.47 1393.15 483.913L1393.37 484.363ZM1422.96 470.487L1423.16 470.943C1428.33 468.609 1433.33 466.404 1438.19 464.33L1438 463.87L1437.8 463.411C1432.93 465.488 1427.92 467.695 1422.75 470.032L1422.96 470.487ZM1453.12 457.672L1453.3 458.138C1458.57 456.075 1463.68 454.185 1468.66 452.47L1468.5 451.997L1468.33 451.524C1463.34 453.245 1458.22 455.139 1452.94 457.207L1453.12 457.672ZM1484.07 447.088L1484.2 447.569C1489.62 446.035 1494.89 444.73 1500.08 443.656L1499.98 443.166L1499.88 442.676C1494.67 443.756 1489.36 445.067 1483.93 446.607L1484.07 447.088ZM1516.14 440.54L1516.2 441.037C1521.65 440.402 1527.06 440.037 1532.47 439.945L1532.46 439.445L1532.45 438.945C1527 439.038 1521.57 439.405 1516.08 440.043L1516.14 440.54ZM1548.8 439.986L1548.76 440.484C1554.08 440.925 1559.46 441.623 1564.94 442.582L1565.03 442.089L1565.11 441.597C1559.6 440.633 1554.19 439.931 1548.84 439.488L1548.8 439.986ZM1581.05 445.541L1580.92 446.026C1586.02 447.319 1591.23 448.819 1596.61 450.528L1596.76 450.052L1596.91 449.575C1591.52 447.861 1586.28 446.355 1581.17 445.056L1581.05 445.541ZM1612.23 455.375L1612.06 455.844C1616.99 457.659 1622.07 459.632 1627.3 461.762L1627.49 461.299L1627.68 460.836C1622.43 458.702 1617.35 456.725 1612.41 454.905L1612.23 455.375ZM1642.63 467.683L1642.43 468.141C1647.24 470.24 1652.2 472.458 1657.31 474.796L1657.52 474.341L1657.73 473.886C1652.61 471.547 1647.65 469.326 1642.83 467.224L1642.63 467.683ZM1672.35 481.244L1672.13 481.696C1674.59 482.859 1677.08 484.046 1679.61 485.259L1679.83 484.808L1680.04 484.357C1677.51 483.144 1675.02 481.956 1672.56 480.792L1672.35 481.244ZM1679.83 484.808L1679.61 485.259C1681.87 486.339 1684.19 487.244 1686.56 487.98L1686.71 487.503L1686.86 487.025C1684.53 486.303 1682.25 485.416 1680.04 484.357L1679.83 484.808ZM1701.26 489.902L1701.25 490.402C1706.13 490.565 1711.1 490.14 1716.08 489.169L1715.98 488.678L1715.88 488.187C1710.98 489.145 1706.08 489.562 1701.28 489.402L1701.26 489.902ZM1730.12 484.427L1730.31 484.89C1734.83 483.051 1739.26 480.774 1743.53 478.091L1743.26 477.667L1743 477.244C1738.77 479.897 1734.39 482.147 1729.93 483.964L1730.12 484.427ZM1755.08 468.795L1755.41 469.169C1759.08 465.919 1762.52 462.334 1765.69 458.438L1765.31 458.122L1764.92 457.807C1761.78 461.66 1758.37 465.206 1754.75 468.421L1755.08 468.795ZM1773.67 445.938L1774.1 446.186C1776.53 441.948 1778.64 437.454 1780.39 432.726L1779.93 432.552L1779.46 432.379C1777.73 437.054 1775.63 441.498 1773.24 445.69L1773.67 445.938ZM1783.9 418.323L1784.39 418.418C1784.85 416.009 1785.22 413.554 1785.5 411.055L1785 411L1784.5 410.945C1784.23 413.418 1783.86 415.846 1783.41 418.229L1783.9 418.323Z"
            fill="#EC5137"
            className="flowing-line"
          />

                    {/* Flowing dashed path & vivid pulsating dot animations */}
          <defs>
            <style>{`
              @keyframes dashFlow {
                from {
                  stroke-dashoffset: 0;
                }
                to {
                  stroke-dashoffset: -100;
                }
              }
              @keyframes dotRadarPulse {
                0% {
                  r: 8px;
                  opacity: 0.9;
                  stroke-width: 3px;
                }
                50% {
                  r: 22px;
                  opacity: 0.5;
                  stroke-width: 2px;
                }
                100% {
                  r: 34px;
                  opacity: 0;
                  stroke-width: 0px;
                }
              }
              @keyframes dotCoreBreathe {
                0%, 100% {
                  transform: scale(0.9);
                  filter: drop-shadow(0 0 4px rgba(236, 81, 55, 0.4));
                }
                50% {
                  transform: scale(1.4);
                  filter: drop-shadow(0 0 10px rgba(236, 81, 55, 0.9));
                }
              }
              .flowing-line {
                animation: dashFlow 2.8s linear infinite;
              }
              .radar-dot {
                animation: dotRadarPulse 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
              }
              .core-dot-1 {
                transform-origin: 532px 645px;
                animation: dotCoreBreathe 1.8s ease-in-out infinite;
              }
              .core-dot-2 {
                transform-origin: 981px 510px;
                animation: dotCoreBreathe 1.8s ease-in-out infinite 0.5s;
              }
              .core-dot-3 {
                transform-origin: 1431px 467px;
                animation: dotCoreBreathe 1.8s ease-in-out infinite 1s;
              }
              .core-dot-4 {
                transform-origin: 1673.5px 481.5px;
                animation: dotCoreBreathe 1.8s ease-in-out infinite 1.5s;
              }
            `}</style>
          </defs>

          {/* Dot 1: (532, 645) */}
          <circle cx="532" cy="645" fill="none" stroke="#EC5137" className="radar-dot" />
          <circle cx="532" cy="645" r="9" fill="#EC5137" className="core-dot-1" />

          {/* Dot 2: (981, 510) */}
          <circle cx="981" cy="510" fill="none" stroke="#EC5137" className="radar-dot" style={{ animationDelay: '0.5s' }} />
          <circle cx="981" cy="510" r="9" fill="#EC5137" className="core-dot-2" />

          {/* Dot 3: (1431, 467) */}
          <circle cx="1431" cy="467" fill="none" stroke="#EC5137" className="radar-dot" style={{ animationDelay: '1s' }} />
          <circle cx="1431" cy="467" r="9" fill="#EC5137" className="core-dot-3" />

          {/* Dot 4: (1673.5, 481.5) */}
          <circle cx="1673.5" cy="481.5" fill="none" stroke="#EC5137" className="radar-dot" style={{ animationDelay: '1.5s' }} />
          <circle cx="1673.5" cy="481.5" r="7" fill="#EC5137" className="core-dot-4" />
        </svg>

        {/* Animated Paper Plane: flying reveal & floating hover */}
        <motion.div
          className="absolute pointer-events-none z-20"
          style={{
            left: `${(1708.4 / 1920) * 100}%`,
            top: `${((342 - 340) / 580) * 100}%`,
            width: `${(121 / 1920) * 100}%`,
          }}
          initial={{ opacity: 0, scale: 0.4, x: -30, y: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        >
          <motion.img
            src={exploreArrowIcon}
            alt="Paper Plane"
            className="w-full h-auto object-contain drop-shadow-xl"
            animate={{
              y: [-5, 6, -5],
              x: [-3, 4, -3],
              rotate: [-1.5, 2.5, -1.5],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* 
          Exact 4 Milestone Node Coordinates from Figma:
          Circle centers:
          Circle 1: x = 317.5, y = 590 (w=144, h=144) -> top = 590 - 72 = 518
          Circle 2: x = 767,   y = 582 (w=143, h=144) -> top = 582 - 72 = 510
          Circle 3: x = 1224.5,y = 535 (w=143, h=144) -> top = 535 - 72 = 463
          Circle 4: x = 1653.5,y = 495 (w=143, h=144) -> top = 495 - 72 = 423
        */}

        {/* Node 1: 100+ Happy Clients */}
        <div
          className="absolute flex flex-col items-center text-center -translate-x-1/2"
          style={{
            left: `${(285.9 / 1920) * 100}%`,
            top: `${((534 - 340) / 580) * 100}%`,
            width: '14.5vw',
          }}
        >
          <div 
            style={{ filter: 'drop-shadow(0px 3.15079px 11.973px rgba(0, 0, 0, 0.18))' }}
            className="w-20 h-20 sm:w-24 sm:h-24 lg:w-[5.4vw] lg:h-[5.4vw] rounded-full bg-[#F5F6F8] flex items-center justify-center border border-white mb-8 lg:mb-[2.2vw] transition-transform duration-300 hover:scale-105 z-10"
          >
            <Icon icon="mdi:account-group" className="w-10 h-10 lg:w-[2.4vw] lg:h-[2.4vw] text-[#697689]" />
          </div>
          <h3 className="text-4xl sm:text-[42px] lg:text-[2.4vw] font-bold text-[#051B2E] leading-none mb-2.5 lg:mb-[0.6vw]">
            100+
          </h3>
          <h4 className="text-lg sm:text-xl lg:text-[1.15vw] font-semibold text-[#051B2E] mb-2.5 lg:mb-[0.55vw] leading-snug">
            Happy Clients
          </h4>
          <p className="text-xs sm:text-[14px] lg:text-[0.78vw] text-[#4B596C] font-normal leading-[1.55] lg:max-w-[12vw]">
            Trusted by businesses across various industries
          </p>
        </div>

        {/* Node 2: 500+ Flipbooks Created */}
        <div
          className="absolute flex flex-col items-center text-center -translate-x-1/2"
          style={{
            left: `${(735.4 / 1920) * 100}%`,
            top: `${((528 - 340) / 580) * 100}%`,
            width: '14.5vw',
          }}
        >
          <div 
            style={{ filter: 'drop-shadow(0px 3.15079px 11.973px rgba(0, 0, 0, 0.18))' }}
            className="w-20 h-20 sm:w-24 sm:h-24 lg:w-[5.4vw] lg:h-[5.4vw] rounded-full bg-[#F5F6F8] flex items-center justify-center border border-white mb-8 lg:mb-[2.2vw] transition-transform duration-300 hover:scale-105 z-10"
          >
            <Icon icon="basil:book-open-outline" className="w-10 h-10 lg:w-[2.4vw] lg:h-[2.4vw] text-[#697689]" />
          </div>
          <h3 className="text-4xl sm:text-[42px] lg:text-[2.4vw] font-bold text-[#051B2E] leading-none mb-2.5 lg:mb-[0.6vw]">
            500+
          </h3>
          <h4 className="text-lg sm:text-xl lg:text-[1.15vw] font-semibold text-[#051B2E] mb-2.5 lg:mb-[0.55vw] leading-snug">
            Flipibooks Created
          </h4>
          <p className="text-xs sm:text-[14px] lg:text-[0.78vw] text-[#4B596C] font-normal leading-[1.55] lg:max-w-[12vw]">
            From Product catalogues to brand stories
          </p>
        </div>

        {/* Node 3: 1M+ Page Views */}
        <div
          className="absolute flex flex-col items-center text-center -translate-x-1/2"
          style={{
            left: `${(1192.9 / 1920) * 100}%`,
            top: `${((480 - 340) / 580) * 100}%`,
            width: '14.5vw',
          }}
        >
          <div 
            style={{ filter: 'drop-shadow(0px 3.15079px 11.973px rgba(0, 0, 0, 0.18))' }}
            className="w-20 h-20 sm:w-24 sm:h-24 lg:w-[5.4vw] lg:h-[5.4vw] rounded-full bg-[#F5F6F8] flex items-center justify-center border border-white mb-8 lg:mb-[2.2vw] transition-transform duration-300 hover:scale-105 z-10"
          >
            <Icon icon="mdi:eye-outline" className="w-10 h-10 lg:w-[2.4vw] lg:h-[2.4vw] text-[#697689]" />
          </div>
          <h3 className="text-4xl sm:text-[42px] lg:text-[2.4vw] font-bold text-[#051B2E] leading-none mb-2.5 lg:mb-[0.6vw]">
            1M+
          </h3>
          <h4 className="text-lg sm:text-xl lg:text-[1.15vw] font-semibold text-[#051B2E] mb-2.5 lg:mb-[0.55vw] leading-snug">
            Page Views
          </h4>
          <p className="text-xs sm:text-[14px] lg:text-[0.78vw] text-[#4B596C] font-normal leading-[1.55] lg:max-w-[12vw]">
            Read, share and explore FlipiBooks across the globe.
          </p>
        </div>

        {/* Node 4: Global Reach */}
        <div
          className="absolute flex flex-col items-center text-center -translate-x-1/2"
          style={{
            left: `${(1621.9 / 1920) * 100}%`,
            top: `${((423 - 340) / 580) * 100}%`,
            width: '14.5vw',
          }}
        >
          <div 
            style={{ filter: 'drop-shadow(0px 3.15079px 11.973px rgba(0, 0, 0, 0.18))' }}
            className="w-20 h-20 sm:w-24 sm:h-24 lg:w-[5.4vw] lg:h-[5.4vw] rounded-full bg-[#F5F6F8] flex items-center justify-center border border-white mb-8 lg:mb-[2.2vw] transition-transform duration-300 hover:scale-105 z-10"
          >
            <svg
              viewBox="0 0 26 26"
              className="w-10 h-10 lg:w-[2.4vw] lg:h-[2.4vw]"
              fill="none"
            >
              {/* Globe in #697689 */}
              <path
                fill="#697689"
                d="M13 2C6.383 2 1 7.383 1 14s5.383 12 12 12s12-5.383 12-12c0-2.01-.498-3.896-1.375-5.563c-.133.264-.267.515-.406.782c-.263.508-.54 1.021-.782 1.531c.25.715.422 1.471.5 2.25h-1.312c-.072.335-.125.65-.125.969V15h1.438a9.9 9.9 0 0 1-1.282 4H18.72c.22-.938.347-1.975.437-3.031h-1.97a19 19 0 0 1-.53 3.031H9.343a19.2 19.2 0 0 1-.594-4h7.75v-1.031a4.7 4.7 0 0 0-.125-.969H8.75a19.2 19.2 0 0 1 .594-4h5.344a31 31 0 0 1-.97-2h-3.687c.827-1.887 1.92-3 2.969-3c0-.695.125-1.348.344-1.969C13.229 2.027 13.116 2 13 2M8.875 4.906a12.4 12.4 0 0 0-1 2.094h-2a10 10 0 0 1 3-2.094M4.344 9H7.28a21.4 21.4 0 0 0-.531 4H3.062a9.9 9.9 0 0 1 1.282-4m-1.282 6H6.75c.059 1.425.243 2.77.531 4H4.344a9.9 9.9 0 0 1-1.282-4m2.813 6h2c.288.776.625 1.473 1 2.094a10 10 0 0 1-3-2.094m4.156 0h5.938c-.827 1.887-1.92 3-2.969 3s-2.143-1.113-2.969-3m8.094 0h2a10 10 0 0 1-3 2.094c.375-.62.712-1.317 1-2.094"
              />
              {/* Location pin in #EC5137 */}
              <path
                fill="#EC5137"
                d="M19 0c-2.209 0-4 1.793-4 4c0 2.665 3.5 6.306 3.5 9.969h1C19.501 10.306 23 6.77 23 4c0-2.207-1.791-4-4-4m0 1.938a2.063 2.063 0 1 1-.002 4.126A2.063 2.063 0 0 1 19 1.937z"
              />
            </svg>
          </div>
          <h4 className="text-2xl sm:text-[25px] lg:text-[1.35vw] font-semibold text-[#051B2E] mb-2.5 lg:mb-[0.55vw] leading-snug">
            Global Reach
          </h4>
          <p className="text-xs sm:text-[14px] lg:text-[0.78vw] text-[#4B596C] font-normal leading-[1.55] lg:max-w-[12vw]">
            Share Everywhere, Anytime.
          </p>
        </div>

      </div>

      {/* Mobile Stack fallback (under md) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:hidden mt-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#F5F6F8] flex items-center justify-center border border-white mb-3 shadow-sm">
            <Icon icon="mdi:account-group" className="w-9 h-9 text-[#697689]" />
          </div>
          <h3 className="text-3xl font-bold text-[#051B2E]">100+</h3>
          <h4 className="text-base font-semibold text-[#051B2E] mb-1">Happy Clients</h4>
          <p className="text-xs text-[#4B596C]">Trusted by businesses across various industries</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#F5F6F8] flex items-center justify-center border border-white mb-3 shadow-sm">
            <Icon icon="basil:book-open-outline" className="w-9 h-9 text-[#697689]" />
          </div>
          <h3 className="text-3xl font-bold text-[#051B2E]">500+</h3>
          <h4 className="text-base font-semibold text-[#051B2E] mb-1">Flipibooks Created</h4>
          <p className="text-xs text-[#4B596C]">From Product catalogues to brand stories</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#F5F6F8] flex items-center justify-center border border-white mb-3 shadow-sm">
            <Icon icon="mdi:eye-outline" className="w-9 h-9 text-[#697689]" />
          </div>
          <h3 className="text-3xl font-bold text-[#051B2E]">1M+</h3>
          <h4 className="text-base font-semibold text-[#051B2E] mb-1">Page Views</h4>
          <p className="text-xs text-[#4B596C]">Read, share and explore FlipiBooks across the globe.</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#F5F6F8] flex items-center justify-center border border-white mb-3 shadow-sm">
            <Icon icon="mdi:earth" className="w-9 h-9 text-[#697689]" />
          </div>
          <h4 className="text-xl font-semibold text-[#051B2E] mb-1">Global Reach</h4>
          <p className="text-xs text-[#4B596C]">Share Everywhere, Anytime.</p>
        </div>
      </div>

    </section>
  );
}
