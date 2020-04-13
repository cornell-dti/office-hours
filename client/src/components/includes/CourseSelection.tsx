import * as React from 'react';
const DEFAULT_COURSE_ID = String(window.localStorage.getItem('lastid') || 1);

type Props = { isEdit: boolean };
type State = { selectedCourses: readonly FireCourse[] };

class CourseSelection extends React.Component<Props, State> {
    state: State = { selectedCourses: [] };

    selectCourse = (course: FireCourse, addCourse: boolean) => {
        this.setState(({ selectedCourses }) => ({
            selectedCourses: addCourse
                ? [...selectedCourses, course]
                : selectedCourses.filter(c => c !== course)
        }));
    };

    render() {
        const selectedCourses = this.state.selectedCourses.length === 0 ?
            'No Classes Chosen' : this.state.selectedCourses.map(c => c.code).join(', ');

        return (
            <div>
                {this.props.isEdit && <div className="EnrollBar">
                    <div className="EnrolledCourses web">
                        {selectedCourses}
                    </div>
                    <div className="buttons">
                        <button className={'save' + (this.state.selectedCourses.length === 0 ? ' disabled' : '')}>
                            Save
                        </button>
                        <form action={'/course/' + DEFAULT_COURSE_ID} method="get">
                            <button className="cancel">
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>}
            </div>
        );
    }
}

export default CourseSelection;
