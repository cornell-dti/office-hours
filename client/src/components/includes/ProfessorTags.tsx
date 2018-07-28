import * as React from 'react';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import ProfessorAddNew from './ProfessorAddNew';
import ProfessorTagInfo from './ProfessorTagInfo';
import ProfessorTagsTable from './ProfessorTagsTable';
import TopBar from './TopBar';
import { Loader } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { graphql, ChildProps } from 'react-apollo';

const QUERY = gql`
query FindTagsByCourse($_courseId: Int!) {
    courseByCourseId(courseId: $_courseId) {
        tagsByCourseId {
            totalCount
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
            tagsByCourseId: {
                totalCount: number
                nodes: [AppTag]
            }
        }
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
        var numRows: number = 0;

        if (this.props.data.courseByCourseId) {
            numRows = this.props.data.courseByCourseId.tagsByCourseId.totalCount;
            this.props.data.courseByCourseId.tagsByCourseId.nodes.forEach((node: AppTag) => {
                assignmentName.push(node.name);
                isActivated.push(node.activated);
                numQuestions.push(0);
            });
        }

        const { loading } = this.props.data;

        return (
            <div className="ProfessorView">
                <div className="ProfessorTags">
                    <ProfessorSidebar
                        course="CS 1380"
                        selected={3}
                    />
                    <div className="rightOfSidebar">
                        <TopBar
                            user={{
                                computedName: 'Michael Clarkson',
                                computedAvatar: 'https://www.cs.cornell.edu/~clarkson/img/mrc_gates300.jpg',
                                userId: -1
                            }}
                        />
                        <div className="main">
                            <ProfessorAddNew
                                text={'Add New Assignment'}
                                content={
                                    <ProfessorTagInfo
                                        isNew={true}
                                    />
                                }
                            />
                            {loading && <Loader active={true} content={'Loading'} />}
                            {!loading &&
                                <div className="Calendar">
                                    <ProfessorTagsTable
                                        assignmentName={assignmentName}
                                        isActivated={isActivated}
                                        numQuestions={numQuestions}
                                        numRows={numRows}
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
