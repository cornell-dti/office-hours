import { expect } from 'chai';
import 'mocha';
import {shallow} from "enzyme";
import React from "react";
import {getDummyCourse} from "../../generators/dummy";
import {getDummySession} from "../../generators/dummysession";
import AddQuestion from "../../../components/includes/AddQuestion";
import {MOBILE_BREAKPOINT} from "../../../components/includes/SessionQuestionsContainer";

describe('AddQuestion', function(){
    // Perform setup
    const course = getDummyCourse();
    const session: FireSession = getDummySession(course.courseId);
    it('should display correctly', function(){
        const wrapper = shallow(<AddQuestion
            session={session}
            course={course}
            mobileBreakpoint={MOBILE_BREAKPOINT}
        />);
        // TODO: Test
    });
});
