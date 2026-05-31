interface Props {
    quote?: string
}

const PullQuote = ({ quote = "Quiet thoughts for loud days." }: Props) => (
    <div className="pull-quote my-12">
        <p className="pull-quote-text">{quote}</p>
        <p className="pull-quote-attr">— Z-Tales</p>
    </div>
)

export default PullQuote