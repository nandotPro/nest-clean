export abstract class ValueObject<Props> {
   protected props: Props;

    protected constructor(props: Props) {
        this.props = props;
    }

    public equals(valueObject: ValueObject<any>): boolean {
        if (valueObject === null || valueObject === undefined) {
            return false;
        }

        if (valueObject.props === null || valueObject.props === undefined) {
            return false;
        }

        return JSON.stringify(valueObject.props) === JSON.stringify(this.props);
    }
}