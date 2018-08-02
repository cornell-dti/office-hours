import * as React from 'react';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import ProfessorAddNew from './ProfessorAddNew';
import ProfessorTagsTable from './ProfessorTagsTable';
import TopBar from './TopBar';
import { Loader } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { graphql, ChildProps } from 'react-apollo';

const QUERY = gql`
query FindTagsByCourse($_courseId: Int!) {
    courseByCourseId(courseId: $_courseId) {
        code
        tagsByCourseId {
            nodes {
                name
                level
                activated
            }
        }
    }
}
`;

const withData = graphql<InputProps, Response>(
    QUERY, {
        options: ({ match }) => ({
            variables: {
                _courseId: match.params.courseId
            }
        })
    }
);

type InputProps = {
    match: {
        params: {
            courseId: number
        }
    },
    data: {
        loading: boolean,
        courseByCourseId?: {
            code: string
            tagsByCourseId: {
                nodes: [AppTag]
            }
        },
        refetch: Function
    }
};

class ProfessorTags extends React.Component<ChildProps<InputProps, Response>> {

    state: {
        selectedWeekEpoch: number
    };

    render() {

        var assignmentName: string[] = [];
        var isActivated: boolean[] = [];
        var numQuestions: number[] = [];
        var courseCode: string = 'Loading...';

        if (this.props.data.courseByCourseId) {
            courseCode = this.props.data.courseByCourseId.code;
            this.props.data.courseByCourseId.tagsByCourseId.nodes.forEach((node: AppTag) => {
                assignmentName.push(node.name);
                isActivated.push(node.activated);
                numQuestions.push(0);
            });
        }

        const { loading, refetch } = this.props.data;

        return (
            <div className="ProfessorView">
                <div className="ProfessorTags">
                    <ProfessorSidebar
                        courseId={this.props.match.params.courseId}
                        code={courseCode}
                        selected={3}
                    />
                    <div className="rightOfSidebar">
                        <TopBar
                            user={{
                                computedName: 'Michael Clarkson',
                                computedAvatar: 'https://www.cs.cornell.edu/~clarkson/img/mrc_gates300.jpg',
                                userId: -1
                            }}
                            role="professor"
                            context="professor"
                        />
                        <div className="main">
                            <ProfessorAddNew
                                courseId={this.props.match.params.courseId}
                                refreshCallback={refetch}
                            />
                            {loading && <Loader active={true} content={'Loading'} />}
                            {!loading &&
                                <div className="Calendar">
                                    <ProfessorTagsTable
                                        assignmentName={assignmentName}
                                        isActivated={isActivated}
                                        numQuestions={numQuestions}
                                    />
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withData(ProfessorTags);
