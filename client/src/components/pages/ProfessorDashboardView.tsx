import * as React from 'react';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
// import QuestionsBarChart from '../includes/QuestionsBarChart';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Redirect } from 'react-router';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { BarDatum } from '@nivo/bar';

const METADATA_QUERY = gql`
query GetMetadata($courseId: Int!, $level: Int!) {
    apiGetCurrentUser {
        nodes {
            computedName
            computedAvatar
            courseUsersByUserId(condition:{courseId:$courseId}) {
                nodes {
                    role
                }
            }
        }
    }
    courseByCourseId(courseId: $courseId) {
        code
    }
    allTags(condition:{courseId:$courseId, level:$level}) {
        nodes {
            name
            tagRelationsByParentId {
                nodes {
                    tagByChildId {
                        name
                    }
                }
            }
            tagId
            activated
        }
    }
}`;

interface ProfessorMetadataData {
    apiGetCurrentUser: {
        nodes: [AppUserRole]
    };
    courseByCourseId: {
        code: string
    };
    allTags: {
        nodes: [AppTag]
    };
}

interface MetadataVariables {
    courseId: number;
    level: number;
}

interface CategoryTag {
    category: string;
    totalQuestions: number;
    childTags: {
        name: string,
        questionCount: number
    }[];
}

class ProfessorMetadataDataQuery extends Query<ProfessorMetadataData, MetadataVariables> { }

class ProfessorDashboardView extends React.Component {

    props: {
        match: {
            params: {
                courseId: string;
            }
        }
    };

    state: {
        currentCategory: CategoryTag | undefined;
        categories: CategoryTag[];
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            currentCategory: undefined,
            categories: []
        };
    }

    public handleUpdateCategory = (event: React.SyntheticEvent<HTMLElement, Event>,
                                   data: DropdownProps): void => {
        console.log('worked!');
        let newCategoryTag = this.state.categories.find((c) => c.category === data.value);
        this.setState({ category: newCategoryTag });
    }

    render() {
        let courseId = parseInt(this.props.match.params.courseId, 10);
        return (
            <div className="ProfessorView">
                <ProfessorMetadataDataQuery
                    query={METADATA_QUERY}
                    variables={{
                        courseId: courseId,
                        level: 1
                    }}
                >
                    {({ loading, data }) => {
                        var courseCode: string = 'Loading...';
                        // let barGraphData: {}[] = [];
                        let barsQuestionsByTag: BarDatum[] = [];
                        if (!loading && data) {
                            courseCode = data.courseByCourseId.code;
                            if (data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role !== 'professor') {
                                return <Redirect to={'/course/' + this.props.match.params.courseId} />;
                            }
                            data.allTags.nodes.forEach((t) => {
                                let category = {
                                    category: t.name,
                                    totalQuestions: 0,
                                    childTags: []
                                } as CategoryTag;
                                if (t.tagRelationsByParentId) {
                                    t.tagRelationsByParentId.nodes.forEach((c) => {
                                        let childTag = c.tagByChildId;
                                        let tagIndex = category.childTags.findIndex(tag =>
                                            (tag.name === childTag.name));
                                        if (tagIndex === -1) {
                                            let newChildObj = {
                                                name: childTag.name,
                                                questionCount: 1
                                            };
                                            category.childTags.push(newChildObj);
                                        } else {
                                            category.childTags[tagIndex].questionCount++;
                                        }
                                        category.totalQuestions++;
                                    });
                                }
                                this.state.categories.push(category);
                            });
                            console.log(JSON.stringify(this.state.categories));
                            if (this.state.currentCategory) {
                                this.state.currentCategory.childTags.forEach((t) => {
                                    barsQuestionsByTag.push({
                                        [t.name]: t.questionCount
                                    });
                                    let newBar = {
                                        'tag': c.childTags
                                    };
                                });
                            }
                        }
                        return (
                            <React.Fragment>
                                <ProfessorSidebar
                                    courseId={courseId}
                                    code={courseCode}
                                    selected={2}
                                />
                                {data && data.apiGetCurrentUser &&
                                    <TopBar
                                        courseId={courseId}
                                        user={data.apiGetCurrentUser.nodes[0]}
                                        context="professor"
                                        role={data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role}
                                    />
                                }
                                <section className="rightOfSidebar">
                                    <div className="main">
                                        <div className="Category-dropdown-container">
                                            <Dropdown
                                                placeholder="Select Category to View"
                                                fluid={true}
                                                selection={true}
                                                onChange={this.handleUpdateCategory}
                                                options={tagsByCategory.map(category => {
                                                    let name = category.category;
                                                    return (
                                                        {
                                                            key: name,
                                                            text: name,
                                                            value: name
                                                        }
                                                    );
                                                })}
                                            />
                                        </div>
                                        <p className="ComingSoon">
                                            Coming soon!
                                        </p>
                                        <p className="ComingSoon">
                                            Coming soon!!!
                                        </p>
                                    </div>
                                </section>
                            </React.Fragment>
                        );
                    }}
                </ProfessorMetadataDataQuery>
            </div>
        );
    }
}

export default ProfessorDashboardView;
