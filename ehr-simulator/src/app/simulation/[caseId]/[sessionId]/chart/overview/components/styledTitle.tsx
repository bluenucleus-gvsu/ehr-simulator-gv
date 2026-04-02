interface StyledTitleProps {
  firstLetter: string;
  secondLetter: string;
  color: string;
}

const StyledTitle = ({ firstLetter, secondLetter, color }: StyledTitleProps) => {
  return (
    <div className="px-2">
      <h1 className="text-xl">
        <span className="relative inline-block px-3 py-1">
          <span
            className={`absolute inset-0 ${color} rounded-full scale-110`}
            style={{
              top: '6%',
              left: '0%',
              minWidth: '2.4rem',
              minHeight: '2.2rem',
            }}
          ></span>
          <span className="relative">
            {firstLetter}
          </span>
        </span>
        <span className="-ml-3 relative">{secondLetter}</span>
      </h1>
    </div>
  )
}

export default StyledTitle