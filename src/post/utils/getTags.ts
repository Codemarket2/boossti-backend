import { TemplateInstanceModel } from '../../template/utils/templateInstanceModel';
import Template from '../../template/utils/templateModel';

export const getTags = async (body) => {
  let postBody = body;
  postBody = postBody.split('^^__');
  let tags: any = [];
  postBody.forEach((m) => {
    if (m.includes('@@@__')) {
      const tag = m.split('@@@__').pop();
      tags.push(tag);
    }
  });
  if (tags.length > 0) {
    let typeTags: any = [];
    typeTags = await Template.find({
      _id: {
        $in: tags,
      },
    });
    typeTags = typeTags.map((l) => ({ tag: l._id, tagModel: 'Template' }));
    let itemTags: any = [];
    itemTags = await TemplateInstanceModel.find({
      _id: {
        $in: tags,
      },
    });
    itemTags = itemTags.map((l) => ({ tag: l._id, tagModel: 'TemplateInstance' }));
    tags = [...typeTags, ...itemTags];
  }
  // console.log('tags', tags);
  return tags;
};
